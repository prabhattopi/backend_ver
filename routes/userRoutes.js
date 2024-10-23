const express = require('express');
const { registerUser, loginUser, googleLogin, googleLogOut } = require("../controllers/userController");
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/google_id",googleLogin)
router.post("/logout",protect,googleLogOut)
module.exports = router;
