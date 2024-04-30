// const db = require("../config/database");
// const catchASyncError = require("../middlewares/catchASyncError");
// const ErrorHandler = require("../middlewares/errors");
// const { mailTester } = require("../utils/nodemailer");
// const { Checkgroup } = require("./groupController");
// const dayjs = require("dayjs");

// // --------------------------------- START OF TASK RELATED API ----------------------------------
// //
// //
// // creating task API
// exports.createTask = catchASyncError(async (req, res, next) => {
//   var { task_name, task_description, task_plan, task_notes, task_app_acronym } =
//     req.body;
//   // getting current user's username to assign it as task owner
//   const task_owner = req.user.username;
//   const task_creator = task_owner;
//   const task_status = "open";
//   // check if task name is empty or not

//   console.log("give me this: ", req.body);
//   if (!task_name || task_name.trim() === "") {
//     throw next(new ErrorHandler("Task name is required", 400));
//   }

//   if (!task_notes || task_notes === undefined || task_notes.trim() === "") {
//     task_notes = "";
//   }

//   if (!validatePlanTask(task_name)) {
//     throw next(
//       new ErrorHandler(
//         "Task name has to have less than 45 characters and no special symbols",
//         400
//       )
//     );
//   }

//   if (!validatePlanTask(task_description)) {
//     throw next(
//       new ErrorHandler("Task description has to be less than 255 characters")
//     );
//   }

//   const permSql = `SELECT app_permit_create, app_rnumber FROM applications where app_acronym =?`;
//   const [permSqlRows, permSqlFields] = await db.execute(permSql, [
//     task_app_acronym,
//   ]);

//   // could be an unneccessary check because app_permits cannot accept null values
//   if (permSqlRows.length === 0) {
//     return next(
//       new ErrorHandler(
//         `There are no permissions granted for ${task_app_acronym}`,
//         400
//       )
//     );
//   }

//   // logging the permission result
//   console.log("This is query result of permsql: ", [
//     permSqlRows[0].app_permit_create,
//   ]);

//   // checking if user that is trying to create the plan
//   const checkPlanAuth = await Checkgroup(task_owner, [
//     permSqlRows[0].app_permit_create,
//   ]);
//   if (!checkPlanAuth) {
//     throw next(
//       new ErrorHandler(
//         `${task_owner} is not allowed to create task for ${task_app_acronym}`,
//         400
//       )
//     );
//   }

//   // getting current date, and time for audit trail
//   // time will displayed like this : 19-01-2024 11:25:55
//   const currentDate = dayjs();
//   const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
//   const task_createdate = currentDate.format("DD-MM-YYYY");

//   const notesDelimiter = " ====== ";
//   //const auditTrailFormat = notesDelimiter + formattedDate + notesDelimiter;

//   const auditTrailLog = `\n${notesDelimiter} Task created on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Task notes : \n ${task_notes} \n\n ===================================================================== \n`;

//   const task_id = `${task_app_acronym}_${permSqlRows[0].app_rnumber + 1}`;
//   const newRnum = permSqlRows[0].app_rnumber + 1;

//   const taskSQL = `INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?,?)`;

//   console.log(
//     task_name,
//     task_id,
//     task_description,
//     task_status,
//     task_owner,
//     task_creator,
//     task_createdate,
//     auditTrailLog,
//     task_plan,
//     task_app_acronym
//   );

//   const [taskRows, taskFields] = await db.execute(taskSQL, [
//     task_name,
//     task_id,
//     task_description,
//     task_status,
//     task_owner,
//     task_creator,
//     task_createdate,
//     auditTrailLog,
//     task_plan,
//     task_app_acronym,
//   ]);
//   console.log(newRnum);
//   // update application R number
//   const updateRnumSQL = `UPDATE applications SET app_rnumber=? WHERE app_acronym=?`;
//   const [rnumRows, rnumFields] = await db.execute(updateRnumSQL, [
//     newRnum,
//     task_app_acronym,
//   ]);

//   return res.status(200).json({
//     success: true,
//     message: "Task has been added successfully",
//   });
// });

// exports.getTask = catchASyncError(async (req, res, next) => {
//   //   const { task_app_acronym } = req.query;
//   const { task_app_acronym } = req.body;

//   const sql = `SELECT * FROM tasks WHERE task_app_acronym =?`;
//   const [rows, fields] = await db.execute(sql, [task_app_acronym]);

//   return res.status(200).json({
//     success: true,
//     message: `Tasks for ${task_app_acronym} retrieved successfully`,
//     data: rows,
//   });
// });

// exports.getTaskInfo = catchASyncError(async (req, res, next) => {
//   const { task_id } = req.body;

//   const sql = `SELECT * FROM tasks WHERE task_id =?`;

//   const [rows, fields] = await db.execute(sql, [task_id]);

//   return res.status(200).json({
//     success: true,
//     message: `Task info for ${task_id} retrieved successfully`,
//     data: rows,
//   });
// });

// exports.getTaskPlans = catchASyncError(async (req, res, next) => {
//   const { app_acronym } = req.body;

//   const sql = `SELECT plan_mvp_name FROM plans WHERE plan_app_acronym=?`;

//   const [rows, fields] = await db.execute(sql, [app_acronym]);
//   return res.status(200).json({
//     success: true,
//     message: `Plans for ${app_acronym} retrieved successfully`,
//     data: rows,
//   });
// });

// exports.editTask = catchASyncError(async (req, res, next) => {
//   var {
//     task_id,
//     task_description,
//     task_status,
//     task_notes,
//     task_plan,
//     app_acronym,
//   } = req.body;
//   const task_owner = req.user.username;

//   console.log(
//     `task_id: ${task_id}, ${task_description}, ${task_status}, ${task_notes}, ${task_plan}, ${app_acronym}`
//   );

//   if (!task_notes || task_notes === undefined || task_notes.trim() === "") {
//     task_notes = "";
//   }

//   //validating if task_description is more than 255 characters
//   if (!validateWordCount(task_description)) {
//     throw next(
//       new ErrorHandler("Task description has to be less than 255 characters")
//     );
//   }

//   // retrieving task
//   const taskSQL = `SELECT * FROM tasks where task_id =?`;
//   const [taskSQLRows, taskSQLfields] = await db.execute(taskSQL, [task_id]);
//   if (taskSQLRows.length === 0) {
//     throw next(new ErrorHandler("Task does not exist", 400));
//   }

//   var prevPlan;
//   var currentPlan;

//   if (taskSQLRows[0].task_plan === null) {
//     prevPlan = " ";
//   } else {
//     prevPlan = taskSQLRows[0].task_plan;
//   }

//   if (task_plan === null) {
//     currentPlan = "";
//   } else {
//     currentPlan = task_plan;
//   }

//   // checking user perms to make edits to task (not sure if needed)
//   // because technically in front end API can be called to verify if button can be accessed
//   let appPermission;
//   switch (task_status) {
//     case "create":
//       appPermission = "app_permit_create";
//       break;
//     case "open":
//       appPermission = "app_permit_open";
//       break;
//     case "todo":
//       appPermission = "app_permit_todolist";
//       break;
//     case "doing":
//       appPermission = "app_permit_doing";
//       break;
//     case "done":
//       appPermission = "app_permit_done";
//       break;
//   }
//   console.log("this is the state to check: ", task_status);
//   console.log("task id to : ", task_id);
//   console.log("permission to check: ", appPermission);
//   const sql = `SELECT ${appPermission} FROM applications WHERE app_acronym =?`;
//   const [rows, fields] = await db.execute(sql, [app_acronym]);
//   console.log(
//     "usergroup permissions retrieved from db: ",
//     rows[0][appPermission]
//   );

//   const userGroup = rows[0][appPermission];
//   console.log(`Username: ${task_owner}, Usergroup: ${userGroup}`);
//   const checkAuth = await Checkgroup(task_owner, [userGroup]);
//   if (!checkAuth) {
//     throw next(new ErrorHandler(`${task_owner} is not permitted`, 400));
//   }

//   //storing previous task notes
//   const prevNote = taskSQLRows[0].task_notes;

//   // date for audit trail
//   const currentDate = dayjs();
//   const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");

//   const notesDelimiter = " ====== ";
//   const auditTrailLog = `\n${notesDelimiter} Task edited on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Plan Changed from '${prevPlan}' to '${currentPlan}' \n Task description : ${task_description} \n Task notes : \n ${task_notes} \n\n =================================================================== \n`;

//   const newNote = auditTrailLog + prevNote;

//   const updateTaskSQL = `UPDATE tasks SET task_description =?, task_plan =?, task_notes=?, task_owner=? WHERE task_id=?`;

//   const [updateTaskRows, updateTaskFields] = await db.execute(updateTaskSQL, [
//     task_description,
//     task_plan,
//     newNote,
//     task_owner,
//     task_id,
//   ]);

//   if (updateTaskRows.affectedRows === 0) {
//     throw next(new ErrorHandler("Error editing notes", 400));
//   }
//   return res.status(200).json({
//     success: true,
//     data: taskSQLRows[0],
//   });
// });

// exports.promoteTask = catchASyncError(async (req, res, next) => {
//   var {
//     task_id,
//     task_description,
//     task_status,
//     task_notes,
//     task_plan,
//     app_acronym,
//   } = req.body;
//   const task_owner = req.user.username;

//   console.log(
//     `task_id: ${task_id}, ${task_description}, ${task_status}, ${task_notes}, ${task_plan}, ${app_acronym}`
//   );

//   if (!task_notes || task_notes === undefined || task_notes.trim() === "") {
//     task_notes = "";
//   }

//   if (!validateWordCount(task_description)) {
//     throw next(
//       new ErrorHandler("Task description has to be less than 255 characters")
//     );
//   }
//   //validating if task_description is more than 255 characters

//   // retrieving task
//   const taskSQL = `SELECT * FROM tasks where task_id =?`;
//   const [taskSQLRows, taskSQLfields] = await db.execute(taskSQL, [task_id]);
//   if (taskSQLRows.length === 0) {
//     throw next(new ErrorHandler("Task does not exist", 400));
//   }

//   //storing initial task data to new data for email

//   // checking user perms to make edits to task (not sure if needed)
//   // because technically in front end API can be called to verify if button can be accessed
//   let newState = "";
//   let appPermission;
//   switch (task_status) {
//     case "open":
//       appPermission = "app_permit_open";
//       newState = "todo";
//       break;
//     case "todo":
//       appPermission = "app_permit_todolist";
//       newState = "doing";
//       break;
//     case "doing":
//       appPermission = "app_permit_doing";
//       newState = "done";
//       break;
//     case "done":
//       appPermission = "app_permit_done";
//       newState = "closed";
//       break;
//     default:
//       //error
//       throw next(new ErrorHandler("You have an error", 400));
//   }

//   const sql = `SELECT * FROM applications WHERE app_acronym =?`;
//   const [rows, fields] = await db.execute(sql, [app_acronym]);
//   console.log(
//     "usergroup permissions retrieved from db: ",
//     rows[0][appPermission]
//   );
//   console.log(
//     "usergroup permissions retrieved from db: ",
//     rows[0]["app_permit_done"]
//   );

//   const getUserSQL = `SELECT email FROM accounts WHERE groupname = ? OR groupname LIKE ? OR groupname LIKE ? OR groupname LIKE ?`;
//   const [userSQLRow, userSQLFields] = await db.execute(getUserSQL, [
//     rows[0]["app_permit_done"],
//     `%,${rows[0]["app_permit_done"]}`,
//     `%,${rows[0]["app_permit_done"]},%`,
//     `${rows[0]["app_permit_done"]},%`,
//   ]);
//   console.log("User email : ", userSQLRow);
//   const emailArray = userSQLRow.map(({ email }) => email);
//   console.log("Email Array: ", emailArray);

//   const userGroup = rows[0][appPermission];
//   console.log(`Username: ${task_owner}, Usergroup: ${userGroup}`);
//   const checkAuth = await Checkgroup(task_owner, [userGroup]);
//   if (!checkAuth) {
//     throw next(new ErrorHandler(`${task_owner} is not permitted`, 400));
//   }

//   //storing retrieved task_state
//   const prevState = taskSQLRows[0].task_status;

//   //storing previous plan and current plan to manipulate what displays on the audit trail
//   var prevPlan;
//   var currentPlan;

//   if (taskSQLRows[0].task_plan === null) {
//     prevPlan = " ";
//   } else {
//     prevPlan = taskSQLRows[0].task_plan;
//   }

//   if (task_plan === null) {
//     currentPlan = "";
//   } else {
//     currentPlan = task_plan;
//   }

//   //storing previous task notes
//   const prevNote = taskSQLRows[0].task_notes;

//   const currentDate = dayjs();
//   const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");

//   const notesDelimiter = " ====== ";
//   const auditTrailLog = `\n${notesDelimiter} Task promoted from ${prevState} to ${newState} on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Plan Changed from '${prevPlan}' to '${currentPlan}' \n Task description : ${task_description} \n Task notes : \n ${task_notes} \n\n =============================================================== \n`;
//   const newNote = auditTrailLog + prevNote;

//   const updateTaskSQL = `UPDATE tasks SET task_description =?, task_plan =?, task_notes=?, task_owner=?, task_status=? WHERE task_id=?`;

//   const [updateTaskRows, updateTaskFields] = await db.execute(updateTaskSQL, [
//     task_description,
//     task_plan,
//     newNote,
//     task_owner,
//     newState,
//     task_id,
//   ]);

//   if (updateTaskRows.affectedRows === 0) {
//     throw next(new ErrorHandler("Error editing notes", 400));
//   }

//   if (task_status === "doing" && newState === "done") {
//     mailTester(
//       emailArray,
//       `Request for review`,
//       `${task_owner} has requested ${task_id} for approval`
//     );
//   }

//   return res.status(200).json({
//     success: true,
//     data: taskSQLRows[0],
//   });
// });

// exports.demoteTask = catchASyncError(async (req, res, next) => {
//   var {
//     task_id,
//     task_description,
//     task_status,
//     task_notes,
//     task_plan,
//     app_acronym,
//   } = req.body;
//   const task_owner = req.user.username;

//   console.log(
//     `task_id: ${task_id}, ${task_description}, ${task_status}, ${task_notes}, ${task_plan}, ${app_acronym}`
//   );

//   //validating if task_description is more than 255 characters
//   if (!validateWordCount(task_description)) {
//     throw next(
//       new ErrorHandler("Task description has to be less than 255 characters")
//     );
//   }

//   // retrieving task
//   const taskSQL = `SELECT * FROM tasks where task_id =?`;
//   const [taskSQLRows, taskSQLfields] = await db.execute(taskSQL, [task_id]);
//   if (taskSQLRows.length === 0) {
//     throw next(new ErrorHandler("Task does not exist", 400));
//   }

//   if (!(task_status === taskSQLRows[0].task_status)) {
//     throw next(new ErrorHandler("Refresh page", 400));
//   }

//   // checking user perms to make edits to task (not sure if needed)
//   // because technically in front end API can be called to verify if button can be accessed
//   let newState = "";
//   let appPermission;
//   switch (task_status) {
//     case "doing":
//       appPermission = "app_permit_doing";
//       newState = "todo";
//       break;
//     case "done":
//       appPermission = "app_permit_done";
//       newState = "doing";
//       break;
//     default:
//       //error
//       throw next(new ErrorHandler("You have an error", 400));
//   }
//   console.log("this is the state to check: ", task_status);
//   console.log("task id to : ", task_id);
//   console.log("permission to check: ", appPermission);
//   const sql = `SELECT ${appPermission} FROM applications WHERE app_acronym =?`;
//   const [rows, fields] = await db.execute(sql, [app_acronym]);
//   console.log(
//     "usergroup permissions retrieved from db: ",
//     rows[0][appPermission]
//   );

//   const userGroup = rows[0][appPermission];
//   console.log(`Username: ${task_owner}, Usergroup: ${userGroup}`);
//   const checkAuth = await Checkgroup(task_owner, [userGroup]);
//   if (!checkAuth) {
//     throw next(new ErrorHandler(`${task_owner} is not permitted`, 400));
//   }

//   //storing retrieved task_state
//   const prevState = taskSQLRows[0].task_status;

//   //storing previous plan and current plan to manipulate what displays on the audit trail
//   var prevPlan;
//   var currentPlan;

//   if (taskSQLRows[0].task_plan === null) {
//     prevPlan = " ";
//   } else {
//     prevPlan = taskSQLRows[0].task_plan;
//   }

//   if (task_plan === null) {
//     currentPlan = "";
//   } else {
//     currentPlan = task_plan;
//   }

//   //storing previous task notes
//   const prevNote = taskSQLRows[0].task_notes;
//   console.log(prevNote);

//   const currentDate = dayjs();
//   const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");

//   const notesDelimiter = " ====== ";
//   const auditTrailLog = `\n${notesDelimiter} Task demoted from ${prevState} to ${newState} on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Plan Changed from '${prevPlan}' to '${currentPlan}' \n Task description : ${task_description} \nTask notes : \n ${task_notes} \n\n =============================================================== \n`;
//   // const stateTrailLog = `${notesDelimiter}`
//   const newNote = auditTrailLog + prevNote;

//   const updateTaskSQL = `UPDATE tasks SET task_description =?, task_plan =?, task_notes=?, task_owner=?, task_status=? WHERE task_id=?`;

//   const [updateTaskRows, updateTaskFields] = await db.execute(updateTaskSQL, [
//     task_description,
//     task_plan,
//     newNote,
//     task_owner,
//     newState,
//     task_id,
//   ]);

//   if (updateTaskRows.affectedRows === 0) {
//     throw next(new ErrorHandler("Error editing notes", 400));
//   }
//   return res.status(200).json({
//     success: true,
//     data: taskSQLRows[0],
//   });
// });
