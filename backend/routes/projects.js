const express = require("express");
const router = express.Router();
const {
  getProjects, getProject, getProjectOverview, createProject,
  updateProject, archiveProject, deleteProject,
  getProjectMembers, addMember, removeMember
} = require("../controllers/projectController");
const { protect, managerOnly } = require("../middleware/auth");

router.get("/", protect, getProjects);
router.get("/:id/overview", protect, getProjectOverview);
router.get("/:id/members", protect, getProjectMembers);
router.get("/:id", protect, getProject);
router.post("/", protect, managerOnly, createProject);
router.put("/:id", protect, managerOnly, updateProject);
router.patch("/:id/archive", protect, managerOnly, archiveProject);
router.patch("/:id/members/add", protect, managerOnly, addMember);
router.patch("/:id/members/remove", protect, managerOnly, removeMember);
router.delete("/:id", protect, managerOnly, deleteProject);

module.exports = router;
