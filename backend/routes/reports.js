const express = require("express");
const router = express.Router();
const { getDashboardStats, getProjectProgress, getProjectReport, getSprintVelocity, getTeamPerformance } = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

router.get("/dashboard", protect, getDashboardStats);
router.get("/progress", protect, getProjectProgress);
router.get("/project/:projectId", protect, getProjectReport);
router.get("/velocity", protect, getSprintVelocity);
router.get("/team", protect, getTeamPerformance);

module.exports = router;
