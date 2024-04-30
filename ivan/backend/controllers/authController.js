const db = require('../config/database');
const catchASyncError = require('../middlewares/catchASyncError');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');

// user login functionality
exports.userLogin = catchASyncError(async (req, res, next) => {
    const { userId, password } = req.body; 

    //if username or password is not entered
    if (!userId || !password) {
        // return res.status(401).send('Please enter username/password');
        return next(new ErrorHandler('Please enter username/password', 400));
    };

    //checking if username exist in database
    const [row, field] = await db.execute('SELECT * FROM accounts WHERE username = ?', [userId]);

    //if username does not exist in the database there will be no result
    if (row.length == 0) {
        return next(new ErrorHandler('Invalid credentials', 401));
    };

    //check if password matches entered password
    const isPassMatch = await bcrypt.compare(password, row[0].password);
    if (!isPassMatch) {
        return next(new ErrorHandler('Invalid credentials', 401));
    };

    //checking if user status is active or disabled
    //if disabled don't allow login
    if (row[0].isactive === 'disabled') {
        return next(new ErrorHandler('Account is disabled', 401));
    };

    //creating jwt token
    const token = jwt.sign({userId : userId}, process.env.JWT_SECRET, 
                        {expiresIn : process.env.JWT_EXPIRES_TIME});
    
    delete row[0].password;
    row[0].token = token;

    res.status(200).json({
        success : true,
        message : 'User is logged in',
        user : row[0],
        token
    });
});

exports.userLogout = catchASyncError(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Log out successfully'
    })
});

exports.validToken = catchASyncError(async(req, res) => {
    return res.status(200).json({
        success:true,
        message: req.user
    })
})

// exports.validToken = catchASyncError(async(req, res) => {
//     // let token;
//     // console.log('this is req.headers info: ',req.headers.authorization);
//     // // if token is valid then assign it to token variable declared above
//     // if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     //     token = req.headers.authorization.split(' ')[1];
//     // }
    
//     // // if token does not exist return error
//     // if(!token) {
//     //     // return next(new ErrorHandler('Login first to access this resource.', 401));
//     //     return res.status(401).json({
//     //         success: false,
//     //         message: 'Login first to use this resource'
//     //     })
//     // }

//     // // check if token is valid
//     // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // console.log(decoded);

//     // // finding user in database that matches token id
//     // const [row, data] = await db.execute(`SELECT * FROM accounts where username = ?`, [decoded.userId]);

//     // if (row.length == 0) {
//     //     return res.status(400).json({
//     //         success: false,
//     //         message: 'Invalid JWT Token'
//     //     })
//     // }

//     // row[0].token = token;
//     // req.user = row[0];
//     // req.user.userId = decoded.userId;

//     // next();
//     return res.status(200).json({
//         success:true,
//         message: req.user
//     })
// })