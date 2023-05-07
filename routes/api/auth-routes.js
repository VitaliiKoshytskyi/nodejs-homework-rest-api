const express = require("express");

const authController = require("../../controllers/auth-controllers")

const authenticate = require("../../middlewares/authenticate");

const upload = require("../../middlewares/upload");

const { validateUpdateContact } = require("../../validation/validate.js");

const { schemas } = require("../../models/user.js");

const router = express.Router();

router.post("/register", validateUpdateContact(schemas.userRegisterSchema), authController.register);

router.get("/verify/:verificationToken", authController.verify);

router.post("/verify",validateUpdateContact(schemas.emailSchema), authController.resendVerifyEmail)

router.post("/login", validateUpdateContact(schemas.userLoginSchema), authController.login);

router.get("/current", authenticate, authController.getCurrent);

router.post("/logout", authenticate, authController.logout);

router.patch("/avatars",authenticate,upload.single("avatar"),authController.updateAvatar)


module.exports = router;
