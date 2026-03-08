const express = require("express");
const router = express.Router();
const {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
} = require("../controllers/sprintController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getSprints);
router.get("/:id", getSprint);
router.post("/", createSprint);
router.put("/:id", updateSprint);
router.delete("/:id", deleteSprint);

module.exports = router;
