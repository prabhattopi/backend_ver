const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const router = express.Router();

router
  .route("/")
  .get(protect, getItems) // Get items, admin can see all, users only their own
  .post(protect, createItem); // RBAC for item creation

router
  .route("/:id")
  .put(protect, updateItem) // RBAC for item update
  .delete(protect, deleteItem); // RBAC for item deletion

module.exports = router;
