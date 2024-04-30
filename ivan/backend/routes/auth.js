const express = require('express');
const router = express.Router();

const { 
    userLogin,
    userLogout, 
    validToken
} = require('../controllers/authController');

const { isAuthenticated } = require('../middlewares/authMidware');

router.route('/login').post(userLogin);
router.route('/logout').get(isAuthenticated, userLogout);
router.route('/verifyToken').post(isAuthenticated, validToken)

module.exports = router;