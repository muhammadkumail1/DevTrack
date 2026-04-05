const express = require("express");
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, archiveProject, deleteProject } = require("../controllers/projectController");
const { protect, managerOnly } = require("../middleware/auth");

router.get("/", protect, getProjects);
router.get("/:id", protect, getProject);
router.post("/", protect, managerOnly, createProject);
router.put("/:id", protect, managerOnly, updateProject);
router.patch("/:id/archive", protect, managerOnly, archiveProject);
router.delete("/:id", protect, managerOnly, deleteProject);

module.exports = router;
