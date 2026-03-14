const express = require("express");
const router = express.Router();
const { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getTasks);
router.get("/:id", protect, getTask);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);
router.patch("/:id/status", protect, updateTaskStatus);
router.delete("/:id", protect, deleteTask);

module.exports = router;
