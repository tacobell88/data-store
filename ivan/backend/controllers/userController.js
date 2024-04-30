const db = require("../config/database");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");
const catchASyncError = require("../middlewares/catchASyncError");

// display all user function
exports.showAllUser = catchASyncError(async (req, res, next) => {
  const [rows, fields] = await db.execute(
    `SELECT id,username,email,groupname,isactive FROM accounts`
  );
  return res.status(200).json({
    success: true,
    message: rows,
  });
});

// create a new user function
exports.createUser = catchASyncError(async (req, res, next) => {
  var { userId, password, email, groupname, isactive } = req.body;

  // if username and/or password has no input
  if (!userId || !password) {
    return next(new ErrorHandler("Username/password required", 400));
  }

  // if username is valid input password will be checked
  if (!validatePassword(password)) {
    return next(
      new ErrorHandler(
        "Password needs to be 8-10char and contains alphanumeric and special character",
        400
      )
    );
  }

  // email is optional so if email is not valid input, user email will be saved as null
  if (!email) {
    email = null;
  }

  // user group is optional if user does not select a user group, user group will be saved null
  if (!groupname) {
    groupname = null;
  }

  if (!isactive) {
    return next(new ErrorHandler("User status is required", 401));
  }

  if (!validateInput(username)) {
    return next(
      new ErrorHandler(
        "Username needs to be between 0-45 characters and no special characters/spaces",
        400
      )
    );
  }

  //hashing password on new user creation
  const hashPassword = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO accounts (username, password, email, groupname, isactive) VALUES (?,?,?,?,?)`;
  // console.log(db.execute(sql, [username, hashPassword, email, groupname, user_status]));
  const [row, field] = await db.execute(sql, [
    userId,
    hashPassword,
    email,
    groupname,
    isactive,
  ]);

  return res.status(200).json({
    success: true,
    message: "User successfully added into database",
  });
});

// admin edits user details
exports.adminEditUser = catchASyncError(async (req, res, next) => {
  console.log("req.user:", req.user);
  var { id, userId, password, email, groupname, isactive } = req.body;
  console.log("** This will show the user that is being edited ***");
  console.log(
    "User ID: ",
    id,
    "User:",
    userId,
    "Pw:",
    password,
    "Email:",
    email,
    "Groups:",
    groupname,
    "Status:",
    isactive
  );

  if (!groupname.includes("admin")) {
    console.log("groupname does not admin");
  } else {
    console.log("groupname has admin");
  }

  // email is optional so if email is not valid input, user email will be saved as null
  if (!email) {
    email = null;
  }

  if (password === undefined) {
    password = null; // Set password to null if it's undefined
  }

  if (groupname === "" || !groupname) {
    throw next(new ErrorHandler("User group is mandatory", 400));
  }
  console.log(`User group from admin editing function: ${groupname}`);

  if (password) {
    if (!validatePassword(password)) {
      return next(
        new ErrorHandler(
          "Password needs to be 8-10char and contains alphanumeric and special character",
          400
        )
      );
    }
    password = await bcrypt.hash(password, 10);
  } else {
    password = null;
  }

  if (userId === "admin" && !groupname.includes("admin")) {
    throw next(
      new ErrorHandler("Unable to remove admin user group from user", 400)
    );
  }

  if (groupname.includes("admin") && isactive === "disabled") {
    throw next(
      new ErrorHandler("Unable to disable user with admin rights", 400)
    );
  }

  //if password==null then use old password database value, if email==null then set null in database
  const sql = `UPDATE accounts SET username = ?, email = ?, groupname = ?, isactive = ?,password = COALESCE(?,password) WHERE id = ?;`;
  const [row, fields] = await db.execute(sql, [
    userId,
    email,
    groupname,
    isactive,
    password,
    id,
  ]);

  return res.status(200).json({
    success: true,
    message: "Edit user success",
  });
});

exports.editUserProfile = catchASyncError(async (req, res, next) => {
  console.log("req.user:", req.user);
  // Ensure this matches the structure of req.user
  const userId = req.user["userId"];
  console.log("UserID:", userId);
  var { password, email } = req.body;

  if (!email) {
    email = null;
  }

  if (password === undefined) {
    password = null; // Set password to null if it's undefined
  }

  if (password) {
    if (!validatePassword(password)) {
      throw next(new ErrorHandler("Invalid Password", 400));
    }
    password = await bcrypt.hash(password, 10);
  }
  console.log("Email:", email, "Password:", password, "UserID:", userId);
  const sql = `UPDATE accounts SET email = ?, password = COALESCE(?,password) WHERE username = ?;`;
  try {
    const [row, fields] = await db.execute(sql, [email, password, userId]);
    return res.status(200).json({
      success: true,
      message: "User profile updated",
    });
  } catch (error) {
    console.error("Database error:", error);
    throw next(new ErrorHandler("Database error", 500));
  }
});

exports.getUser = catchASyncError(async (req, res) => {
  // const userId = req.user['userId'];
  // const username = req.user.username;
  console.log("getUser {req.user.username} info:", req.user.username);
  const username = req.user.username;

  console.log(username);
  sql =
    "SELECT id,username,email,groupname,isactive FROM accounts WHERE username = ?";
  const [row, fields] = await db.execute(sql, [username]);
  console.log(row[0]);

  if (row.length > 1) {
    return next(new ErrorHandler("User does not exist: ", 400));
  }

  return res.status(200).json({
    success: true,
    message: "User exist",
    results: row[0],
  });
});

function validatePassword(str) {
  // 8-10 characters, 1 alphabet, 1 number, 1 special character
  const passRegex = new RegExp(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/
  );
  return passRegex.test(str);
}

function validateInput(str) {
  const validRegex = new RegExp(/^[a-zA-Z0-9]{1,45}$/);
  return validRegex.test(str);
}
