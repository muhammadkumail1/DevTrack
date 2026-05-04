const express = require("express");
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, adminOnly, managerOnly } = require("../middleware/auth");

router.get("/", protect, getUsers);
router.get("/:id", protect, getUser);
router.post("/", protect, adminOnly, createUser);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
