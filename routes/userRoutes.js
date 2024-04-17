const express = require("express");
const {registerController, authController, loginController, verifyOTPController} = require("../controllers/user");
const protect = require("../middleware/authMiddleware");
router = express.Router();

router.post("/register",registerController)
router.post("/get-user",protect,authController)
router.post("/login",loginController)
// router.post("/otpVerify",verifyOTPController)

module.exports = router;