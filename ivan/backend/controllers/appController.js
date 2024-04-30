const db = require("../config/database");
const catchASyncError = require("../middlewares/catchASyncError");
const ErrorHandler = require("../utils/errorHandler");
const { mailTester } = require("../utils/nodemailer");
const { Checkgroup } = require("./GroupController");
const dayjs = require("dayjs");

function validRnumber(str) {
  const validRegex = new RegExp(/^[0-9]\d*$/);
  return validRegex.test(str);
}

function validateInput(str) {
  // this regex is to check alpha / alpha numeric only (no special characters) and less than 45 characters
  const validRegex = new RegExp(/^[a-zA-Z][a-zA-Z0-9]{0,44}$/);
  return validRegex.test(str);
}

function validatePlanTask(str) {
  const validRegex = new RegExp(
    /^(?=.{1,45}$)[a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+)*$/
  );
  return validRegex.test(str);
}

function validateWordCount(str) {
  const validRegex = new RegExp(/^.{0,255}$/);
  return validRegex.test(str);
}

// API to create application
exports.createApp = catchASyncError(async (req, res, next) => {
  var {
    app_acronym,
    app_description,
    app_rnumber,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = req.body;

  const userId = req.user.username;
  console.log("CreateApp function requesting for username: ", req.user);

  if (!validateInput(app_acronym)) {
    throw next(
      new ErrorHandler(
        "App acronym has to have less than 45 characters and no special symbols or spaces",
        400
      )
    );
  }

  if (app_rnumber == "") {
    throw next(new ErrorHandler("App rnumber is required", 400));
  }

  // regex validation for rnumber to be within constraints
  if (!validRnumber(app_rnumber) && app_rnumber < 100000) {
    throw next(
      new ErrorHandler(
        "App rnumber has to be more than 0 and a whole number",
        400
      )
    );
  }

  if (!validateWordCount(app_description)) {
    throw next(
      new ErrorHandler(
        "App description has to be less than 255 characters",
        400
      )
    );
  }

  if (!app_acronym || app_acronym.trim() == "") {
    throw next(new ErrorHandler("App acronym is required", 400));
  }

  if (
    !app_permit_create ||
    !app_permit_open ||
    !app_permit_todolist ||
    !app_permit_doing ||
    !app_permit_done
  ) {
    throw next(new ErrorHandler("App permissions are required", 400));
  }

  if (!app_startdate) {
    throw next(new ErrorHandler("App requires a start date", 400));
  }

  if (!app_enddate) {
    throw next(new ErrorHandler("App requires a end date", 400));
  }

  if (app_description == "") {
    app_description = null;
  }

  // checking group to make sure that only pl roles are allowed to add application
  // const response = await Checkgroup(userId, 'pl');
  // if (!response) {
  //     throw next(new ErrorHandler('User is not authorised to create apps', 400))
  // }

  const sql = `INSERT INTO applications (app_acronym, app_description, app_rnumber, app_startdate, app_enddate, 
        app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing,
        app_permit_done) VALUES(?,?,?,?,?,?,?,?,?,?)`;

  const [rows, fields] = await db.execute(sql, [
    app_acronym,
    app_description,
    app_rnumber,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  ]);

  //not sure if this function will be needed
  const sql2 = `SELECT * from applications WHERE app_acronym =?`;

  const [rows2, fields2] = await db.execute(sql2, [app_acronym]);

  return res.status(200).json({
    success: true,
    message: "Application has been added successfully",
    data: rows2[0],
  });
});

// API to get all application information (mainly for view application)
exports.getAllApp = catchASyncError(async (req, res, next) => {
  const sql = "SELECT * FROM applications ";
  const [rows, fields] = await db.execute(sql);

  if (!rows.length) {
    throw next(new ErrorHandler("Error retrieving plans", 400));
  }

  return res.status(200).json({
    success: true,
    message: `Retrieved ${rows.length} applications successfully`,
    data: rows,
  });
});

exports.getApp = catchASyncError(async (req, res, next) => {
  //   const { app_acronym } = req.query;
  const { app_acronym } = req.body;

  const sql =
    "SELECT app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done FROM applications WHERE app_acronym = ?";
  const [rows, fields] = await db.execute(sql, [app_acronym]);

  if (rows.length === 0) {
    return next(
      new ErrorHandler(`There are no applications called ${app_acronym}`, 400)
    );
  }

  return res.status(200).json({
    success: true,
    message: `Retrieved app: '${app_acronym}' successfully`,
    data: rows[0],
  });
});

exports.editApp = catchASyncError(async (req, res, next) => {
  var {
    app_acronym,
    app_description,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = req.body;

  if (!validateWordCount(app_description)) {
    throw next(
      new ErrorHandler(
        "App description has to be less than 255 characters",
        400
      )
    );
  }

  if (!app_startdate || app_startdate === "") {
    throw next(new ErrorHandler("App requires a start date", 400));
  }

  if (!app_enddate || app_enddate === "") {
    throw next(new ErrorHandler("App requires a end date", 400));
  }

  if (
    !app_permit_create ||
    !app_permit_open ||
    !app_permit_todolist ||
    !app_permit_doing ||
    !app_permit_done
  ) {
    throw next(new ErrorHandler("App permissions are required", 400));
  }

  console.log(app_acronym);

  const sql = `UPDATE applications SET app_description=?,app_startdate=?, app_enddate=?, app_permit_create=?, app_permit_open=?, app_permit_todolist=?, app_permit_doing=?, app_permit_done=? WHERE app_acronym =?`;

  const [rows, fields] = await db.execute(sql, [
    app_description,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
    app_acronym,
  ]);

  return res.status(200).json({
    success: true,
    message: `Application: ${app_acronym} edited successfully`,
  });
});

// ====================================START OF PLAN RELATED API ====================================
// to create a plan for the specific application
// *** ADDITIONAL INFO: user is only allowed to create a
exports.createPlan = catchASyncError(async (req, res, next) => {
  // app_acronym should be sent back to the backend so that we know which app we are creating plans for

  console.log("Creating Plan");
  console.log(req.body);
  console.log(req.query);
  var { plan_mvp_name, plan_startdate, plan_enddate } = req.body;

  const { plan_app_acronym } = req.query;

  const username = req.user.username;

  if (!plan_mvp_name || plan_mvp_name.trim() == "") {
    throw next(new ErrorHandler("Plan name is required", 400));
  }

  if (!validatePlanTask(plan_mvp_name)) {
    throw next(
      new ErrorHandler(
        "Plan name has to have less than 45 characters and no special symbols",
        400
      )
    );
  }

  if (!plan_startdate) {
    throw next(new ErrorHandler("Plan requires a start date", 400));
  }

  if (!plan_enddate) {
    throw next(new ErrorHandler("Plan requires a end date", 400));
  }

  // check if app exist in the application before being able to insert a new plan
  const checkAppSql = `SELECT * FROM applications WHERE app_acronym = ?`;
  const [checkAppRows, checkAppFields] = await db.execute(checkAppSql, [
    plan_app_acronym,
  ]);

  if (checkAppRows.length === 0) {
    throw next(
      new ErrorHandler(`${plan_app_acronym} application does not exist`, 400)
    );
  }

  // app permissions to check that user contains the role that is specified under th12e app_permit_create when application created
  const permSql = `SELECT app_permit_open FROM applications where app_acronym =?`;
  const [permSqlRows, permSqlFields] = await db.execute(permSql, [
    plan_app_acronym,
  ]);

  // could be an unneccessary check because app_permits cannot accept null values
  if (permSqlRows.length === 0) {
    return next(
      new ErrorHandler(
        `There are no permissions granted for ${plan_app_acronym}`,
        400
      )
    );
  }

  // logging the permission result
  console.log("This is query result of permsql: ", [
    permSqlRows[0].app_permit_open,
  ]);

  // checking if user that is trying to create the plan
  const checkPlanAuth = await Checkgroup(username, [
    permSqlRows[0].app_permit_open,
  ]);
  if (!checkPlanAuth) {
    throw next(
      new ErrorHandler(
        `${username} is not allowed to create plans for ${plan_app_acronym}`,
        400
      )
    );
  }

  const sql = `INSERT INTO plans (plan_mvp_name, plan_startdate, plan_enddate, plan_app_acronym) VALUES (?,?,?,?)`;
  const [rows, fields] = await db.execute(sql, [
    plan_mvp_name,
    plan_startdate,
    plan_enddate,
    plan_app_acronym,
  ]);

  if (rows.length === 0) {
    throw next(new ErrorHandler("Unable to add plans", 400));
  }

  // to return data of newly added plan for application in json fomat
  const sql2 = `SELECT * from plans WHERE plan_mvp_name =? AND plan_app_acronym =?`;

  const [rows2, fields2] = await db.execute(sql2, [
    plan_mvp_name,
    plan_app_acronym,
  ]);

  return res.status(200).json({
    success: true,
    message: `Plan for '${plan_app_acronym}' added successfully`,
    data: rows2[0],
  });
});

// getting all plans relating to application
exports.getAllPlans = catchASyncError(async (req, res, next) => {
  // requires plan_app_acronym which should be pre determined after user selects on the specific app to view plan
  const { plan_app_acronym } = req.query;

  const sql = `SELECT * FROM plans WHERE plan_app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [plan_app_acronym]);

  if (!rows.length) {
    throw next(
      new ErrorHandler("There are no plans for this application", 400)
    );
  }

  return res.status(200).json({
    success: true,
    message: `Plans for '${plan_app_acronym}' retrieved successfuly`,
    data: rows,
  });
});

//getting specific plan relating to application
exports.getPlan = catchASyncError(async (req, res, next) => {
  const { plan_mvp_name, plan_app_acronym } = req.body;

  const sql = `SELECT * FROM plans WHERE plan_mvp_name =? AND plan_app_acronym=?`;
  const [rows, fields] = await db.execute(sql, [
    plan_mvp_name,
    plan_app_acronym,
  ]);

  if (!rows.length) {
    throw next(new ErrorHandler("Plan does not exist", 400));
  }

  return res.status(200).json({
    success: true,
    message: "Plan retrieved successfully",
    data: rows[0],
  });
});

exports.getPlanNames = catchASyncError(async (req, res, next) => {
  const { plan_app_acronym } = req.query;
  console.log(req.query);

  const sql = `SELECT plan_mvp_name FROM plans WHERE plan_app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [plan_app_acronym]);

  if (rows.length === 0) {
    throw next(new ErrorHandler(`There are no plans for ${plan_app_acronym}`));
  }

  return res.status(200).json({
    success: true,
    message: "Plan name retrieved successfully",
    data: rows,
  });
});

exports.editPlan = catchASyncError(async (req, res, next) => {
  const { plan_mvp_name, plan_startdate, plan_enddate, plan_app_acronym } =
    req.body;

  const username = req.user.username;

  if (!plan_startdate) {
    throw next(new ErrorHandler("Start date is mandatory", 400));
  }

  if (!plan_enddate) {
    throw next(new ErrorHandler("End date is mandatory", 400));
  }

  // get user's username and get the roles of the user
  // then check the user's roles to see if it matches specified app_permit_open role
  // if it matches the the user is allowed to edit the plan
  const permSql = `SELECT app_permit_open FROM applications where app_acronym =?`;
  const [permSqlRows, permSqlFields] = await db.execute(permSql, [
    plan_app_acronym,
  ]);

  // could be an unneccessary check because app_permits cannot accept null values
  if (permSqlRows.length === 0) {
    return next(
      new ErrorHandler(
        `There are no permissions granted for ${plan_app_acronym}`,
        400
      )
    );
  }

  // logging the permission result
  console.log("This is query result of permsql: ", [
    permSqlRows[0].app_permit_open,
  ]);

  // checking if user that is trying to create the plan
  const checkPlanAuth = await Checkgroup(username, [
    permSqlRows[0].app_permit_open,
  ]);
  if (!checkPlanAuth) {
    throw next(
      new ErrorHandler(
        `${username} is not allowed to edit plans for ${plan_app_acronym}`,
        400
      )
    );
  }

  const sql = `UPDATE plans SET plan_startdate =?, plan_enddate =? WHERE plan_mvp_name =? AND plan_app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [
    plan_startdate,
    plan_enddate,
    plan_mvp_name,
    plan_app_acronym,
  ]);

  // console.log(rows[0]);

  // if (!rows.length) {
  //   throw next(new ErrorHandler("Failed to edit plan", 400));
  // }

  return res.status(200).json({
    success: true,
    message: `Plan '${plan_mvp_name}' edited successfully`,
  });
});

// --------------------------------- END OF PLAN RELATED API ----------------------------------
// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------

// --------------------------------- START OF TASK RELATED API ----------------------------------
//
//
// creating task API
exports.createTask = catchASyncError(async (req, res, next) => {
  var { task_name, task_description, task_plan, task_notes, task_app_acronym } =
    req.body;
  // getting current user's username to assign it as task owner
  const task_owner = req.user.username;
  const task_creator = task_owner;
  const task_status = "open";
  // check if task name is empty or not

  console.log("give me this: ", req.body);
  if (!task_name || task_name.trim() === "") {
    throw next(new ErrorHandler("Task name is required", 400));
  }

  if (!task_notes || task_notes === undefined || task_notes.trim() === "") {
    task_notes = "";
  }

  if (!validatePlanTask(task_name)) {
    throw next(
      new ErrorHandler(
        "Task name has to have less than 45 characters and no special symbols",
        400
      )
    );
  }

  if (!validatePlanTask(task_description)) {
    throw next(
      new ErrorHandler("Task description has to be less than 255 characters")
    );
  }

  const permSql = `SELECT app_permit_create, app_rnumber FROM applications where app_acronym =?`;
  const [permSqlRows, permSqlFields] = await db.execute(permSql, [
    task_app_acronym,
  ]);

  // could be an unneccessary check because app_permits cannot accept null values
  if (permSqlRows.length === 0) {
    return next(
      new ErrorHandler(
        `There are no permissions granted for ${task_app_acronym}`,
        400
      )
    );
  }

  // logging the permission result
  console.log("This is query result of permsql: ", [
    permSqlRows[0].app_permit_create,
  ]);

  // checking if user that is trying to create the plan
  const checkPlanAuth = await Checkgroup(task_owner, [
    permSqlRows[0].app_permit_create,
  ]);
  if (!checkPlanAuth) {
    throw next(
      new ErrorHandler(
        `${task_owner} is not allowed to create task for ${task_app_acronym}`,
        400
      )
    );
  }

  // getting current date, and time for audit trail
  // time will displayed like this : 19-01-2024 11:25:55
  const currentDate = dayjs();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
  const task_createdate = currentDate.format("DD-MM-YYYY");

  const notesDelimiter = " ====== ";
  //const auditTrailFormat = notesDelimiter + formattedDate + notesDelimiter;

  const auditTrailLog = `\n${notesDelimiter} Task created on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Task notes : \n ${task_notes} \n\n ===================================================================== \n`;

  const task_id = `${task_app_acronym}_${permSqlRows[0].app_rnumber + 1}`;
  const newRnum = permSqlRows[0].app_rnumber + 1;

  const taskSQL = `INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?,?)`;

  console.log(
    task_name,
    task_id,
    task_description,
    task_status,
    task_owner,
    task_creator,
    task_createdate,
    auditTrailLog,
    task_plan,
    task_app_acronym
  );

  const [taskRows, taskFields] = await db.execute(taskSQL, [
    task_name,
    task_id,
    task_description,
    task_status,
    task_owner,
    task_creator,
    task_createdate,
    auditTrailLog,
    task_plan,
    task_app_acronym,
  ]);
  console.log(newRnum);
  // update application R number
  const updateRnumSQL = `UPDATE applications SET app_rnumber=? WHERE app_acronym=?`;
  const [rnumRows, rnumFields] = await db.execute(updateRnumSQL, [
    newRnum,
    task_app_acronym,
  ]);

  return res.status(200).json({
    success: true,
    message: "Task has been added successfully",
  });
});

exports.getTask = catchASyncError(async (req, res, next) => {
  //   const { task_app_acronym } = req.query;
  const { task_app_acronym } = req.body;

  const sql = `SELECT * FROM tasks WHERE task_app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [task_app_acronym]);

  return res.status(200).json({
    success: true,
    message: `Tasks for ${task_app_acronym} retrieved successfully`,
    data: rows,
  });
});

exports.getTaskInfo = catchASyncError(async (req, res, next) => {
  const { task_id } = req.body;

  const sql = `SELECT * FROM tasks WHERE task_id =?`;

  const [rows, fields] = await db.execute(sql, [task_id]);

  return res.status(200).json({
    success: true,
    message: `Task info for ${task_id} retrieved successfully`,
    data: rows,
  });
});

exports.getTaskPlans = catchASyncError(async (req, res, next) => {
  const { app_acronym } = req.body;

  const sql = `SELECT plan_mvp_name FROM plans WHERE plan_app_acronym=?`;

  const [rows, fields] = await db.execute(sql, [app_acronym]);
  return res.status(200).json({
    success: true,
    message: `Plans for ${app_acronym} retrieved successfully`,
    data: rows,
  });
});

exports.editTask = catchASyncError(async (req, res, next) => {
  var {
    task_id,
    task_description,
    task_status,
    task_notes,
    task_plan,
    app_acronym,
  } = req.body;
  const task_owner = req.user.username;

  console.log(
    `task_id: ${task_id}, ${task_description}, ${task_status}, ${task_notes}, ${task_plan}, ${app_acronym}`
  );

  if (!task_notes || task_notes === undefined || task_notes.trim() === "") {
    task_notes = "";
  }

  //validating if task_description is more than 255 characters
  if (!validateWordCount(task_description)) {
    throw next(
      new ErrorHandler("Task description has to be less than 255 characters")
    );
  }

  // retrieving task
  const taskSQL = `SELECT * FROM tasks where task_id =?`;
  const [taskSQLRows, taskSQLfields] = await db.execute(taskSQL, [task_id]);
  if (taskSQLRows.length === 0) {
    throw next(new ErrorHandler("Task does not exist", 400));
  }

  var prevPlan;
  var currentPlan;

  if (taskSQLRows[0].task_plan === null) {
    prevPlan = " ";
  } else {
    prevPlan = taskSQLRows[0].task_plan;
  }

  if (task_plan === null) {
    currentPlan = "";
  } else {
    currentPlan = task_plan;
  }

  // checking user perms to make edits to task (not sure if needed)
  // because technically in front end API can be called to verify if button can be accessed
  let appPermission;
  switch (task_status) {
    case "create":
      appPermission = "app_permit_create";
      break;
    case "open":
      appPermission = "app_permit_open";
      break;
    case "todo":
      appPermission = "app_permit_todolist";
      break;
    case "doing":
      appPermission = "app_permit_doing";
      break;
    case "done":
      appPermission = "app_permit_done";
      break;
  }
  console.log("this is the state to check: ", task_status);
  console.log("task id to : ", task_id);
  console.log("permission to check: ", appPermission);
  const sql = `SELECT ${appPermission} FROM applications WHERE app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [app_acronym]);
  console.log(
    "usergroup permissions retrieved from db: ",
    rows[0][appPermission]
  );

  const userGroup = rows[0][appPermission];
  console.log(`Username: ${task_owner}, Usergroup: ${userGroup}`);
  const checkAuth = await Checkgroup(task_owner, [userGroup]);
  if (!checkAuth) {
    throw next(new ErrorHandler(`${task_owner} is not permitted`, 400));
  }

  //storing previous task notes
  const prevNote = taskSQLRows[0].task_notes;

  // date for audit trail
  const currentDate = dayjs();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");

  const notesDelimiter = " ====== ";
  const auditTrailLog = `\n${notesDelimiter} Task edited on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Plan Changed from '${prevPlan}' to '${currentPlan}' \n Task description : ${task_description} \n Task notes : \n ${task_notes} \n\n =================================================================== \n`;

  const newNote = auditTrailLog + prevNote;

  const updateTaskSQL = `UPDATE tasks SET task_description =?, task_plan =?, task_notes=?, task_owner=? WHERE task_id=?`;

  const [updateTaskRows, updateTaskFields] = await db.execute(updateTaskSQL, [
    task_description,
    task_plan,
    newNote,
    task_owner,
    task_id,
  ]);

  if (updateTaskRows.affectedRows === 0) {
    throw next(new ErrorHandler("Error editing notes", 400));
  }
  return res.status(200).json({
    success: true,
    data: taskSQLRows[0],
  });
});

exports.promoteTask = catchASyncError(async (req, res, next) => {
  var {
    task_id,
    task_description,
    task_status,
    task_notes,
    task_plan,
    app_acronym,
  } = req.body;
  const task_owner = req.user.username;

  console.log(
    `task_id: ${task_id}, ${task_description}, ${task_status}, ${task_notes}, ${task_plan}, ${app_acronym}`
  );

  if (!task_notes || task_notes === undefined || task_notes.trim() === "") {
    task_notes = "";
  }

  if (!validateWordCount(task_description)) {
    throw next(
      new ErrorHandler("Task description has to be less than 255 characters")
    );
  }
  //validating if task_description is more than 255 characters

  // retrieving task
  const taskSQL = `SELECT * FROM tasks where task_id =?`;
  const [taskSQLRows, taskSQLfields] = await db.execute(taskSQL, [task_id]);
  if (taskSQLRows.length === 0) {
    throw next(new ErrorHandler("Task does not exist", 400));
  }

  //storing initial task data to new data for email

  // checking user perms to make edits to task (not sure if needed)
  // because technically in front end API can be called to verify if button can be accessed
  let newState = "";
  let appPermission;
  switch (task_status) {
    case "open":
      appPermission = "app_permit_open";
      newState = "todo";
      break;
    case "todo":
      appPermission = "app_permit_todolist";
      newState = "doing";
      break;
    case "doing":
      appPermission = "app_permit_doing";
      newState = "done";
      break;
    case "done":
      appPermission = "app_permit_done";
      newState = "closed";
      break;
    default:
      //error
      throw next(new ErrorHandler("You have an error", 400));
  }

  const sql = `SELECT * FROM applications WHERE app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [app_acronym]);
  console.log(
    "usergroup permissions retrieved from db: ",
    rows[0][appPermission]
  );
  console.log(
    "usergroup permissions retrieved from db: ",
    rows[0]["app_permit_done"]
  );

  const getUserSQL = `SELECT email FROM accounts WHERE groupname = ? OR groupname LIKE ? OR groupname LIKE ? OR groupname LIKE ?`;
  const [userSQLRow, userSQLFields] = await db.execute(getUserSQL, [
    rows[0]["app_permit_done"],
    `%,${rows[0]["app_permit_done"]}`,
    `%,${rows[0]["app_permit_done"]},%`,
    `${rows[0]["app_permit_done"]},%`,
  ]);
  console.log("User email : ", userSQLRow);
  const emailArray = userSQLRow.map(({ email }) => email);
  console.log("Email Array: ", emailArray);

  const userGroup = rows[0][appPermission];
  console.log(`Username: ${task_owner}, Usergroup: ${userGroup}`);
  const checkAuth = await Checkgroup(task_owner, [userGroup]);
  if (!checkAuth) {
    throw next(new ErrorHandler(`${task_owner} is not permitted`, 400));
  }

  //storing retrieved task_state
  const prevState = taskSQLRows[0].task_status;

  //storing previous plan and current plan to manipulate what displays on the audit trail
  var prevPlan;
  var currentPlan;

  if (taskSQLRows[0].task_plan === null) {
    prevPlan = " ";
  } else {
    prevPlan = taskSQLRows[0].task_plan;
  }

  if (task_plan === null) {
    currentPlan = "";
  } else {
    currentPlan = task_plan;
  }

  //storing previous task notes
  const prevNote = taskSQLRows[0].task_notes;

  const currentDate = dayjs();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");

  const notesDelimiter = " ====== ";
  const auditTrailLog = `\n${notesDelimiter} Task promoted from ${prevState} to ${newState} on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Plan Changed from '${prevPlan}' to '${currentPlan}' \n Task description : ${task_description} \n Task notes : \n ${task_notes} \n\n =============================================================== \n`;
  const newNote = auditTrailLog + prevNote;

  const updateTaskSQL = `UPDATE tasks SET task_description =?, task_plan =?, task_notes=?, task_owner=?, task_status=? WHERE task_id=?`;

  const [updateTaskRows, updateTaskFields] = await db.execute(updateTaskSQL, [
    task_description,
    task_plan,
    newNote,
    task_owner,
    newState,
    task_id,
  ]);

  if (updateTaskRows.affectedRows === 0) {
    throw next(new ErrorHandler("Error editing notes", 400));
  }

  if (task_status === "doing" && newState === "done") {
    mailTester(
      emailArray,
      `Request for review`,
      `${task_owner} has requested ${task_id} for approval`
    );
  }

  return res.status(200).json({
    success: true,
    data: taskSQLRows[0],
  });
});

exports.demoteTask = catchASyncError(async (req, res, next) => {
  var {
    task_id,
    task_description,
    task_status,
    task_notes,
    task_plan,
    app_acronym,
  } = req.body;
  const task_owner = req.user.username;

  console.log(
    `task_id: ${task_id}, ${task_description}, ${task_status}, ${task_notes}, ${task_plan}, ${app_acronym}`
  );

  //validating if task_description is more than 255 characters
  if (!validateWordCount(task_description)) {
    throw next(
      new ErrorHandler("Task description has to be less than 255 characters")
    );
  }

  // retrieving task
  const taskSQL = `SELECT * FROM tasks where task_id =?`;
  const [taskSQLRows, taskSQLfields] = await db.execute(taskSQL, [task_id]);
  if (taskSQLRows.length === 0) {
    throw next(new ErrorHandler("Task does not exist", 400));
  }

  if (!(task_status === taskSQLRows[0].task_status)) {
    throw next(new ErrorHandler("Refresh page", 400));
  }

  // checking user perms to make edits to task (not sure if needed)
  // because technically in front end API can be called to verify if button can be accessed
  let newState = "";
  let appPermission;
  switch (task_status) {
    case "doing":
      appPermission = "app_permit_doing";
      newState = "todo";
      break;
    case "done":
      appPermission = "app_permit_done";
      newState = "doing";
      break;
    default:
      //error
      throw next(new ErrorHandler("You have an error", 400));
  }
  console.log("this is the state to check: ", task_status);
  console.log("task id to : ", task_id);
  console.log("permission to check: ", appPermission);
  const sql = `SELECT ${appPermission} FROM applications WHERE app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [app_acronym]);
  console.log(
    "usergroup permissions retrieved from db: ",
    rows[0][appPermission]
  );

  const userGroup = rows[0][appPermission];
  console.log(`Username: ${task_owner}, Usergroup: ${userGroup}`);
  const checkAuth = await Checkgroup(task_owner, [userGroup]);
  if (!checkAuth) {
    throw next(new ErrorHandler(`${task_owner} is not permitted`, 400));
  }

  //storing retrieved task_state
  const prevState = taskSQLRows[0].task_status;

  //storing previous plan and current plan to manipulate what displays on the audit trail
  var prevPlan;
  var currentPlan;

  if (taskSQLRows[0].task_plan === null) {
    prevPlan = " ";
  } else {
    prevPlan = taskSQLRows[0].task_plan;
  }

  if (task_plan === null) {
    currentPlan = "";
  } else {
    currentPlan = task_plan;
  }

  //storing previous task notes
  const prevNote = taskSQLRows[0].task_notes;
  console.log(prevNote);

  const currentDate = dayjs();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");

  const notesDelimiter = " ====== ";
  const auditTrailLog = `\n${notesDelimiter} Task demoted from ${prevState} to ${newState} on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Plan Changed from '${prevPlan}' to '${currentPlan}' \n Task description : ${task_description} \nTask notes : \n ${task_notes} \n\n =============================================================== \n`;
  // const stateTrailLog = `${notesDelimiter}`
  const newNote = auditTrailLog + prevNote;

  const updateTaskSQL = `UPDATE tasks SET task_description =?, task_plan =?, task_notes=?, task_owner=?, task_status=? WHERE task_id=?`;

  const [updateTaskRows, updateTaskFields] = await db.execute(updateTaskSQL, [
    task_description,
    task_plan,
    newNote,
    task_owner,
    newState,
    task_id,
  ]);

  if (updateTaskRows.affectedRows === 0) {
    throw next(new ErrorHandler("Error editing notes", 400));
  }
  return res.status(200).json({
    success: true,
    data: taskSQLRows[0],
  });
});

// --------------------------------- END OF TASK RELATED API ----------------------------------

// GETTING APP PERMISSIONS FOR DIFFERENT TASK STATES SO THAT
exports.checkPermissions = catchASyncError(async (req, res, next) => {
  // to pass in the state of each page so that we can use that state to do checkgroup and render buttons as needed
  console.log("this is query: ", req.query);
  const { app_state } = req.body;
  const { app_acronym } = req.query;
  const username = req.user.username;

  let appPermission;
  switch (app_state) {
    case "create":
      appPermission = "app_permit_create";
      break;
    case "open":
      appPermission = "app_permit_open";
      break;
    case "todo":
      appPermission = "app_permit_todolist";
      break;
    case "doing":
      appPermission = "app_permit_doing";
      break;
    case "done":
      appPermission = "app_permit_done";
      break;
  }
  console.log("this is the state to check: ", app_state);
  console.log("app acronym to check: ", app_acronym);
  console.log("permission to check: ", appPermission);
  const sql = `SELECT ${appPermission} FROM applications WHERE app_acronym =?`;
  const [rows, fields] = await db.execute(sql, [app_acronym]);
  console.log(
    "usergroup permissions retrieved from db: ",
    rows[0][appPermission]
  );

  const userGroup = rows[0][appPermission];
  console.log(`Username: ${username}, Usergroup: ${userGroup}`);
  const checkAuth = await Checkgroup(username, [userGroup]);
  if (!checkAuth) {
    throw next(new ErrorHandler(`${username} is not permitted`, 400));
  }
  return res.status(200).json({
    success: true,
    message: `${username} is permitted`,
  });
});

//working as expected
exports.testAuditTrail = catchASyncError(async (req, res, next) => {
  const currentDate = dayjs();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
  const task_createdate = currentDate.format("DD-MM-YYYY");

  const newLine = "\n";
  const notesDelimiter = " ================================ ";
  const auditTrailFormat =
    newLine + notesDelimiter + formattedDate + notesDelimiter;

  console.log(auditTrailFormat);
  console.log(task_createdate);
  return res.status(200).json({
    success: true,
    message: formattedDate,
  });
});
