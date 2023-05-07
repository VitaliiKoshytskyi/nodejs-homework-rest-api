const { Schema, model } = require("mongoose");

const Joi = require("joi");

const { mongooseErrorHandler } = require("../helpers");

const emailRegexp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    password: {
      type: String,
      minlength: 6,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: emailRegexp,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      required:true,
    },
    verify: {
    type: Boolean,
    default: false,
    require:true,
    },
    verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
  },
  { versionKey: false }
);

userSchema.post("save", mongooseErrorHandler);

const userRegisterSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  
});
const schemas = {
  userRegisterSchema,
  userLoginSchema,
  emailSchema
};

const User = model("user", userSchema);

module.exports = { User, schemas };
