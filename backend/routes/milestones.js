const express = require("express");
const router = express.Router();
const { getMilestones, createMilestone, updateMilestone, approveMilestone } = require("../controllers/milestoneController");
const { protect, managerOnly } = require("../middleware/auth");

router.get("/", protect, getMilestones);
router.post("/", protect, createMilestone);
router.put("/:id", protect, updateMilestone);
router.patch("/:id/approve", protect, managerOnly, approveMilestone);

module.exports = router;
