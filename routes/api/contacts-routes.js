const express = require("express");

const isValidId = require("../../middlewares/isValidId")

const authenticate = require("../../middlewares/authenticate")

const { getAllContacts, getContact, addNewContact, deleteContact, editContact, editFavorite, } = require("../../controllers/contacts-controllers.js");

const { validateAddContact, validateUpdateContact,} = require("../../validation/validate.js");

const router = express.Router();

const { contactsAddSchema, contactsEditSchema, favoriteSchema } = require("../../models/contact.js");

router.use(authenticate)

router.get("/", getAllContacts);

router.get("/:contactId",isValidId, getContact);

router.post("/", validateAddContact(contactsAddSchema), addNewContact);

router.put("/:contactId",  isValidId, validateUpdateContact(contactsEditSchema), editContact);

router.delete("/:contactId",  isValidId, deleteContact);

router.patch("/:contactId/favorite", isValidId, validateUpdateContact(favoriteSchema), editFavorite);

module.exports = router;
