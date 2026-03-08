const express = require("express");
const router = express.Router();
const {
  getChangeRequests,
  createChangeRequest,
  updateChangeRequest,
} = require("../controllers/changeRequestController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getChangeRequests);
router.post("/", createChangeRequest);
router.put("/:id", updateChangeRequest);

module.exports = router;
