const express = require("express");
const router = express.Router();
const { getRequirements, createRequirement, updateRequirement } = require("../controllers/requirementController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getRequirements);
router.post("/", protect, createRequirement);
router.put("/:id", protect, updateRequirement);

module.exports = router;
