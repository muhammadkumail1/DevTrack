const express = require("express");
const router = express.Router();
const { getSprints, getSprint, createSprint, updateSprint, deleteSprint } = require("../controllers/sprintController");
const { protect, managerOnly } = require("../middleware/auth");

router.get("/", protect, getSprints);
router.get("/:id", protect, getSprint);
router.post("/", protect, managerOnly, createSprint);
router.put("/:id", protect, managerOnly, updateSprint);
router.delete("/:id", protect, managerOnly, deleteSprint);

module.exports = router;
