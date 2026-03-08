const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", createProject);
router.put("/:id", updateProject);
router.patch("/:id/archive", archiveProject);
router.delete("/:id", deleteProject);

module.exports = router;
