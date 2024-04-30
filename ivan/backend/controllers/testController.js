const db = require("../config/database");
const catchASyncError = require("../middlewares/catchASyncError");
const ErrorHandler = require("../utils/errorHandler");
const { Checkgroup } = require("../controllers/groupController");
const bcrypt = require("bcryptjs");
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

exports.CreateTask = catchASyncError(async (req, res, next) => {
  // const {
  //   username,
  //   password,
  //   task_name,
  //   app_acronym,
  //   task_description,
  //   task_notes,
  //   task_plan,
  // } = req.body;

  const { task_name, app_acronym, task_description, task_notes, task_plan } =
    req.body;

  const task_status = "open";

  if (!username || !password) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const usernameSQL = `SELECT * FROM accounts where username=?`;
  const [usernameRows, usernameFields] = await db.execute(sql, [username]);

  // checking if username exist in database
  if (usernameRows.length === 0) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const checkPassMatch = await bcrypt.compare(
    password,
    usernameRows[0].password
  );
  if (!checkPassMatch) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  if (usernameRows[0].isactive === "disabled") {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const task_owner = username;
  const task_creator = username;

  // checking if there is  task_name input
  if (!task_name || task_name.trim() === "") {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  // validating task notes and making it empty string if no notes typed
  if (!task_notes || task_notes === undefined || task_notes.trim() === "") {
    task_notes = "";
  }

  // checking if task_name conforms to constraints
  if (!validatePlanTask(task_name)) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  // checking if task_description is less than 255 characters
  if (!validatePlanTask(task_description)) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  // checking user permissions for access management
  const permSql = `SELECT app_permit_create, app_rnumber FROM applications where app_acronym =?`;
  const [permSqlRows, permSqlFields] = await db.execute(permSql, [
    task_app_acronym,
  ]);

  // could be an unneccessary check because app_permits cannot accept null values
  if (permSqlRows.length === 0) {
    res.status(400).json({
      code: "",
      data: "",
    });
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
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  // create information for audit trail log
  const currentDate = dayjs();
  const formattedDate = currentDate.format("DD-MM-YYYY HH:mm:ss");
  const task_createdate = currentDate.format("DD-MM-YYYY");

  const notesDelimiter = " ====== ";
  //const auditTrailFormat = notesDelimiter + formattedDate + notesDelimiter;

  const auditTrailLog = `\n${notesDelimiter} Task created on: ${formattedDate} by user : ${task_owner} ${notesDelimiter}\n Task notes : \n ${task_notes} \n\n ===================================================================== \n`;

  const task_id = `${task_app_acronym}_${permSqlRows[0].app_rnumber + 1}`;
  const newRnum = permSqlRows[0].app_rnumber + 1;

  // after everything passes, create task can be executed
  const createTaskSQL = `INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?,?)`;

  const [createTaskRows, crreateTaskFields] = await db.execute(createTaskSQL, [
    task_name,
    task_id,
    task_description,
    task_status,
    task_owner,
    task_creator,
    task_createdate,
    auditTrailLog,
    task_plan,
    app_acronym,
  ]);

  //update application app_rnumber
  const updateRnumSQL = `UPDATE applications SET app_rnumber=? WHERE app_acronym=?`;
  const [rnumRows, rnumFields] = await db.execute(updateRnumSQL, [
    newRnum,
    app_acronym,
  ]);

  // success code
  return res.status(200).json({
    code: "",
    data: "",
  });
});

exports.GetTaskByState = catchASyncError(async (req, res, next) => {
  // const { username, password, app_acronym, task_status } = req.body;
  const { app_acronym, task_status } = req.body;

  if (!username || !password) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const usernameSQL = `SELECT * FROM accounts where username=?`;
  const [usernameRows, usernameFields] = await db.execute(sql, [username]);

  // checking if username exist in database
  if (usernameRows.length === 0) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const checkPassMatch = await bcrypt.compare(
    password,
    usernameRows[0].password
  );
  if (!checkPassMatch) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  if (usernameRows[0].isactive === "disabled") {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  // checking user permissions for access management
  const permSql = `SELECT app_permit_create, app_rnumber FROM applications where app_acronym =?`;
  const [permSqlRows, permSqlFields] = await db.execute(permSql, [
    task_app_acronym,
  ]);

  // could be an unneccessary check because app_permits cannot accept null values
  if (permSqlRows.length === 0) {
    res.status(400).json({
      code: "",
      data: "",
    });
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
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const taskStateSQL = `SELECT task_id from tasks where task_status =? AND task_app_acronym =?`;
  const [taskStateRows, taskStateFields] = await db.execute(taskStateSQL, [
    task_status,
    app_acronym,
  ]);

  if (taskStateRows.length === 0) {
    res.status(400).json({
      code: "SB001",
      message: "Application does not exist",
    });
  }

  const taskIds = taskStateRows.map((row) => row.task_id);

  return res.status(200).json({
    code: "TXN001",
    task_id: taskStateRows,
  });
});

exports.PromoteTask2Done = catchASyncError(async (req, res, next) => {
  const { username, password, task_id, task_notes } = req.body;

  if (!username || !password) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const usernameSQL = `SELECT * FROM accounts where username=?`;
  const [usernameRows, usernameFields] = await db.execute(sql, [username]);

  // checking if username exist in database
  if (usernameRows.length === 0) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  const checkPassMatch = await bcrypt.compare(
    password,
    usernameRows[0].password
  );
  if (!checkPassMatch) {
    res.status(400).json({
      code: "",
      data: "",
    });
  }

  if (usernameRows[0].isactive === "disabled") {
    res.status(400).json({
      code: "",
      data: "",
    });
  }
});
