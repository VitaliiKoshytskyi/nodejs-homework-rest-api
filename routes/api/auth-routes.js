const express = require("express");

const authController = require("../../controllers/auth-controllers")

const authenticate = require("../../middlewares/authenticate")

const { validateUpdateContact } = require("../../validation/validate.js");

const { schemas } = require("../../models/user.js");

const router = express.Router();

router.post("/register", validateUpdateContact(schemas.userRegisterSchema), authController.register);

router.post("/login", validateUpdateContact(schemas.userLoginSchema), authController.login);

router.get("/current", authenticate, authController.getCurrent);

router.post("/logout", authenticate, authController.logout)

module.exports = router;