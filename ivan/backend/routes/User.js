const express = require('express');
const router = express.Router();

const { 
    createGroup,
    getAllUserGroup,
    CheckingGroup
} = require('../controllers/groupController');

const { 
    showAllUser,
    createUser,
    adminEditUser,
    editUserProfile,
    getUser
} = require('../controllers/userController');

const { isAuthenticated,
        isAuthRole } = require('../middlewares/authMidware');

// routes relating to admin user (get list of all users, create a new user, edit user details)
router.route('/users/getUsers').get(isAuthenticated, showAllUser);
router.route('/users/createUser').post(isAuthenticated, isAuthRole("admin"), createUser);
router.route('/users/editUser').post(isAuthenticated, isAuthRole("admin"), adminEditUser);

// route to get details of user for user profile
router.route('/users/userProfile').get(isAuthenticated, getUser);

// routes for user to update their own details
router.route('/users/updateUser').post(isAuthenticated, editUserProfile);

// routes relating to user groups (roles) for admin
router.route('/users/createRole').post(isAuthenticated, isAuthRole("admin"), createGroup);
router.route('/users/getAllRoles').get(isAuthenticated, isAuthRole("admin","pl"), getAllUserGroup);
router.route('/checkGroup').post(isAuthenticated, CheckingGroup);

// routes without protection for debugging
// router.route('/users/getUsers').get(showAllUser);
// router.route('/users/createUser').post(createUser);
// router.route('/users/editUser').post(adminEditUser);

module.exports = router;