const express = require("express");
const router = express.Router();
const {
  getBugs,
  getBug,
  createBug,
  updateBug,
  closeBug,
  deleteBug,
} = require("../controllers/bugController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getBugs);
router.get("/:id", getBug);
router.post("/", createBug);
router.put("/:id", updateBug);
router.patch("/:id/close", closeBug);
router.delete("/:id", deleteBug);

module.exports = router;
