const express = require("express");
const router = express.Router();
const {
  getMilestones,
  createMilestone,
  updateMilestone,
  approveMilestone,
} = require("../controllers/milestoneController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getMilestones);
router.post("/", createMilestone);
router.put("/:id", updateMilestone);
router.patch("/:id/approve", approveMilestone);

module.exports = router;
