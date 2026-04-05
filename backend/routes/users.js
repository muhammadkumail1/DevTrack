const express = require("express");
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, managerOnly } = require("../middleware/auth");

router.get("/", protect, getUsers);
router.get("/:id", protect, getUser);
router.post("/", protect, managerOnly, createUser);
router.put("/:id", protect, managerOnly, updateUser);
router.delete("/:id", protect, managerOnly, deleteUser);

module.exports = router;
