const bcrypt = require("bcrypt");

const gravatar = require("gravatar");

const fs = require("fs/promises");

const path = require("path");

const { nanoid } = require("nanoid");

const avatarsDir = path.resolve("public", "avatars");

const jwt = require("jsonwebtoken");

const resizeAvatar = require("../helpers/resizeAvatar/resizeAvatar");

const { User } = require("../models/user");

const HttpError = require("../helpers/HttpError.js");

const sendEmail = require("../helpers/sendEmail")

const { BASE_URL } = process.env;

const { SECRET_KEY } = process.env;

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });
    const verifyLink = `${BASE_URL}/users/verify/${verificationToken}`
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html:`<a target="_blank" href="${verifyLink}">Click to verify email</a>`
    }
    await sendEmail(verifyEmail)

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req,res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw new Error(404,"User not found")
  }
  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" })
  res.json({
    message:"Verification successful"
  })
}

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(401);
  }
  if (user.verify) {
    res.status(400).json({ message: "Verification has already been passed" });
    return;
  }
  const verifyLink = `${BASE_URL}/users/verify/${user.verificationToken}`;
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html:`<a target="_blank" href="${verifyLink}">Click to verify email</a>`
  };
  await sendEmail(verifyEmail);
  res.status(200).json({ message: "Verification email sent" });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password invalid");
    }
    if (!user.verify) {
      throw HttpError(401, "Email not verified");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password invalid");
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  res.json({
    email,
    subscription: user.subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

const updateAvatar = async (req, res) => {
  const { path: tempUpload, filename } = req.file;
  const { _id } = req.user;
  await resizeAvatar(tempUpload);
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
};

module.exports = {
  getCurrent,
  register,
  login,
  logout,
  updateAvatar,
  verify,
  resendVerifyEmail,
};
