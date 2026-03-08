const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, managerOnly } = require("../middleware/auth");

router.use(protect);
router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", managerOnly, createUser);
router.put("/:id", managerOnly, updateUser);
router.delete("/:id", managerOnly, deleteUser);

module.exports = router;
