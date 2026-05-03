const express = require("express");
const { processCommand, getProjectSuggestions } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// POST /api/ai/command - Process natural language command
router.post("/command", protect, processCommand);

// GET /api/ai/suggestions/:projectId - Get AI suggestions for a project
router.get("/suggestions/:projectId", protect, getProjectSuggestions);

module.exports = router;
