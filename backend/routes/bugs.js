const express = require("express");
const router = express.Router();
const { getBugs, getBug, createBug, updateBug, closeBug, deleteBug } = require("../controllers/bugController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getBugs);
router.get("/:id", protect, getBug);
router.post("/", protect, createBug);
router.put("/:id", protect, updateBug);
router.patch("/:id/close", protect, closeBug);
router.delete("/:id", protect, deleteBug);

module.exports = router;
