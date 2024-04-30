const db = require("../config/database");
// const catchASyncError = require('../middlewares/catchASyncError');
const catchASyncError = require("../middlewares/catchASyncError");
const ErrorHandler = require("../utils/errorHandler");

//creating a new role
exports.createGroup = catchASyncError(async (req, res) => {
  const { groupname } = req.body;

  // if user enters invalid group name (empty field)
  if (!groupname) {
    return res.status(400).send("Please enter a group");
  }

  if (groupname.includes(",")) {
    return res.status(400).send("Invalid group name");
  }
  const sql = `INSERT INTO grouplist (groupname) VALUES (?)`;
  const [row, field] = await db.execute(sql, [groupname]);
  return res.status(200).send("Role has been added into database");
});

//getting all user group to populate in the drop down table
exports.getAllUserGroup = catchASyncError(async (req, res) => {
  const [row, field] = await db.execute("SELECT groupname FROM grouplist");
  res.status(200).json({
    success: true,
    message: row,
  });
});

exports.Checkgroup = catchASyncError(async (userId, GroupNames) => {
  const [row, fields] = await db.execute(
    `SELECT groupname FROM accounts WHERE username= ?;`,
    [userId]
  );
  console.log(GroupNames);
  console.log("(Checkgroup) User user_groups are: ", row);

  // if (row.length > 0 && row[0].groupname) {
  row[0].groupname = row[0].groupname.split(",");
  console.log("This is the split up users user_groups: ", row[0].groupname);

  //get intersection of user group and allowed group to see if user is authorized
  const authorizedGroup = GroupNames.filter((value) =>
    row[0].groupname.includes(value)
  );
  //if len>0 means user is authorized
  if (authorizedGroup.length > 0) {
    return true;
  } else return false;

  //     //new implementation to handle multiple authorised roles
  //     // const hasRequiredRole = GroupNames.some(GroupNames => userGroups.includes(GroupNames))
  //     // console.log('This is the result checkGroup if user group includes passed value:', hasRequiredRole)
  //     console.log('This is the result checkGroup if user group includes passed value: ', row[0].groupname.includes(GroupNames))
  //     const result = row[0].groupname.includes(GroupNames)
  //     console.log(`Is the user part of the group ${GroupNames} : ${result}`)
  //     return result;
  // } else {
  //     return false
  // }
});

// using checkgroup function to implement an API endpoint
exports.CheckingGroup = catchASyncError(async (req, res, next) => {
  const username = req.user.username;
  const group = [req.body.groupname];
  console.log(`(checkinggroup) User to be checked: ${username}`);
  console.log(`(checkinggroup) User groups to be checked: : ${group}`);

  const result = await this.Checkgroup(username, group);
  console.log(`This is the result from executing checking group API: `, result);
  if (result) {
    return res.status(200).json({
      result: result,
      success: true,
      message: `User: ${username} Group: ${group}`,
    });
  } else {
    return next(new ErrorHandler("Checking group failed", 400));
  }
});
