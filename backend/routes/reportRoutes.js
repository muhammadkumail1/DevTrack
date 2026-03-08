const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getProjectProgress,
  getProjectReport,
  getSprintVelocity,
  getTeamPerformance,
} = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/dashboard", getDashboardStats);
router.get("/projects", getProjectProgress);
router.get("/projects/:projectId", getProjectReport);
router.get("/velocity", getSprintVelocity);
router.get("/team", getTeamPerformance);

module.exports = router;
