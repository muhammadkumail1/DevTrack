const express = require("express");
const router = express.Router();
const {
  getRequirements,
  createRequirement,
  updateRequirement,
} = require("../controllers/requirementController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getRequirements);
router.post("/", createRequirement);
router.put("/:id", updateRequirement);

module.exports = router;
