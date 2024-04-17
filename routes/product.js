const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createFood, getAllFoods } = require("../controllers/product");
router = express.Router();

router.post("/addfood", createFood)
router.post("/getAllFood", getAllFoods)

module.exports = router;