// const db = require("../config/database");
// const catchASyncError = require("../middlewares/catchASyncError");
// const ErrorHandler = require("../middlewares/errors");
// const { Checkgroup } = require("./groupController");

// // ====================================START OF PLAN RELATED API ====================================
// // to create a plan for the specific application
// // *** ADDITIONAL INFO: user is only allowed to create a
// exports.createPlan = catchASyncError(async (req, res, next) => {
//   // app_acronym should be sent back to the backend so that we know which app we are creating plans for

//   console.log("Creating Plan");
//   console.log(req.body);
//   console.log(req.query);
//   var { plan_mvp_name, plan_startdate, plan_enddate } = req.body;

//   const { plan_app_acronym } = req.query;

//   const username = req.user.username;

//   if (!plan_mvp_name || plan_mvp_name.trim() == "") {
//     throw next(new ErrorHandler("Plan name is required", 400));
//   }

//   if (!validatePlanTask(plan_mvp_name)) {
//     throw next(
//       new ErrorHandler(
//         "Plan name has to have less than 45 characters and no special symbols",
//         400
//       )
//     );
//   }

//   if (!plan_startdate) {
//     throw next(new ErrorHandler("Plan requires a start date", 400));
//   }

//   if (!plan_enddate) {
//     throw next(new ErrorHandler("Plan requires a end date", 400));
//   }

//   // check if app exist in the application before being able to insert a new plan
//   const checkAppSql = `SELECT * FROM applications WHERE app_acronym = ?`;
//   const [checkAppRows, checkAppFields] = await db.execute(checkAppSql, [
//     plan_app_acronym,
//   ]);

//   if (checkAppRows.length === 0) {
//     throw next(
//       new ErrorHandler(`${plan_app_acronym} application does not exist`, 400)
//     );
//   }

//   // app permissions to check that user contains the role that is specified under th12e app_permit_create when application created
//   const permSql = `SELECT app_permit_open FROM applications where app_acronym =?`;
//   const [permSqlRows, permSqlFields] = await db.execute(permSql, [
//     plan_app_acronym,
//   ]);

//   // could be an unneccessary check because app_permits cannot accept null values
//   if (permSqlRows.length === 0) {
//     return next(
//       new ErrorHandler(
//         `There are no permissions granted for ${plan_app_acronym}`,
//         400
//       )
//     );
//   }

//   // logging the permission result
//   console.log("This is query result of permsql: ", [
//     permSqlRows[0].app_permit_open,
//   ]);

//   // checking if user that is trying to create the plan
//   const checkPlanAuth = await Checkgroup(username, [
//     permSqlRows[0].app_permit_open,
//   ]);
//   if (!checkPlanAuth) {
//     throw next(
//       new ErrorHandler(
//         `${username} is not allowed to create plans for ${plan_app_acronym}`,
//         400
//       )
//     );
//   }

//   const sql = `INSERT INTO plans (plan_mvp_name, plan_startdate, plan_enddate, plan_app_acronym) VALUES (?,?,?,?)`;
//   const [rows, fields] = await db.execute(sql, [
//     plan_mvp_name,
//     plan_startdate,
//     plan_enddate,
//     plan_app_acronym,
//   ]);

//   if (rows.length === 0) {
//     throw next(new ErrorHandler("Unable to add plans", 400));
//   }

//   // to return data of newly added plan for application in json fomat
//   const sql2 = `SELECT * from plans WHERE plan_mvp_name =? AND plan_app_acronym =?`;

//   const [rows2, fields2] = await db.execute(sql2, [
//     plan_mvp_name,
//     plan_app_acronym,
//   ]);

//   return res.status(200).json({
//     success: true,
//     message: `Plan for '${plan_app_acronym}' added successfully`,
//     data: rows2[0],
//   });
// });

// // getting all plans relating to application
// exports.getAllPlans = catchASyncError(async (req, res, next) => {
//   // requires plan_app_acronym which should be pre determined after user selects on the specific app to view plan
//   const { plan_app_acronym } = req.query;

//   const sql = `SELECT * FROM plans WHERE plan_app_acronym =?`;
//   const [rows, fields] = await db.execute(sql, [plan_app_acronym]);

//   if (!rows.length) {
//     throw next(
//       new ErrorHandler("There are no plans for this application", 400)
//     );
//   }

//   return res.status(200).json({
//     success: true,
//     message: `Plans for '${plan_app_acronym}' retrieved successfuly`,
//     data: rows,
//   });
// });

// //getting specific plan relating to application
// exports.getPlan = catchASyncError(async (req, res, next) => {
//   const { plan_mvp_name, plan_app_acronym } = req.body;

//   const sql = `SELECT * FROM plans WHERE plan_mvp_name =? AND plan_app_acronym=?`;
//   const [rows, fields] = await db.execute(sql, [
//     plan_mvp_name,
//     plan_app_acronym,
//   ]);

//   if (!rows.length) {
//     throw next(new ErrorHandler("Plan does not exist", 400));
//   }

//   return res.status(200).json({
//     success: true,
//     message: "Plan retrieved successfully",
//     data: rows[0],
//   });
// });

// exports.getPlanNames = catchASyncError(async (req, res, next) => {
//   const { plan_app_acronym } = req.query;
//   console.log(req.query);

//   const sql = `SELECT plan_mvp_name FROM plans WHERE plan_app_acronym =?`;
//   const [rows, fields] = await db.execute(sql, [plan_app_acronym]);

//   if (rows.length === 0) {
//     throw next(new ErrorHandler(`There are no plans for ${plan_app_acronym}`));
//   }

//   return res.status(200).json({
//     success: true,
//     message: "Plan name retrieved successfully",
//     data: rows,
//   });
// });

// exports.editPlan = catchASyncError(async (req, res, next) => {
//   const { plan_mvp_name, plan_startdate, plan_enddate, plan_app_acronym } =
//     req.body;

//   const username = req.user.username;

//   if (!plan_startdate) {
//     throw next(new ErrorHandler("Start date is mandatory", 400));
//   }

//   if (!plan_enddate) {
//     throw next(new ErrorHandler("End date is mandatory", 400));
//   }

//   // get user's username and get the roles of the user
//   // then check the user's roles to see if it matches specified app_permit_open role
//   // if it matches the the user is allowed to edit the plan
//   const permSql = `SELECT app_permit_open FROM applications where app_acronym =?`;
//   const [permSqlRows, permSqlFields] = await db.execute(permSql, [
//     plan_app_acronym,
//   ]);

//   // could be an unneccessary check because app_permits cannot accept null values
//   if (permSqlRows.length === 0) {
//     return next(
//       new ErrorHandler(
//         `There are no permissions granted for ${plan_app_acronym}`,
//         400
//       )
//     );
//   }

//   // logging the permission result
//   console.log("This is query result of permsql: ", [
//     permSqlRows[0].app_permit_open,
//   ]);

//   // checking if user that is trying to create the plan
//   const checkPlanAuth = await Checkgroup(username, [
//     permSqlRows[0].app_permit_open,
//   ]);
//   if (!checkPlanAuth) {
//     throw next(
//       new ErrorHandler(
//         `${username} is not allowed to edit plans for ${plan_app_acronym}`,
//         400
//       )
//     );
//   }

//   const sql = `UPDATE plans SET plan_startdate =?, plan_enddate =? WHERE plan_mvp_name =? AND plan_app_acronym =?`;
//   const [rows, fields] = await db.execute(sql, [
//     plan_startdate,
//     plan_enddate,
//     plan_mvp_name,
//     plan_app_acronym,
//   ]);

//   // console.log(rows[0]);

//   // if (!rows.length) {
//   //   throw next(new ErrorHandler("Failed to edit plan", 400));
//   // }

//   return res.status(200).json({
//     success: true,
//     message: `Plan '${plan_mvp_name}' edited successfully`,
//   });
// });
