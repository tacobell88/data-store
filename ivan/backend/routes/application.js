const express = require("express");
const router = express.Router();

const { isAuthenticated, isAuthRole } = require("../middlewares/authMidware");

const {
  createApp,
  getAllApp,
  getApp,
  editApp,
  createPlan,
  getAllPlans,
  getPlan,
  editPlan,
  checkPermissions,
  getPlanNames,
  testAuditTrail,
  createTask,
  getTask,
  getTaskInfo,
  getTaskPlans,
  editTask,
  promoteTask,
  demoteTask,
} = require("../controllers/appController");
const {
  CreateTask,
  GetTaskByState,
  PromoteTask2Done,
} = require("../controllers/testController");

// const { createPlan,
//   getAllPlans,
//   getPlan,
//   editPlan,} = require("../controllers/planController");

// const {
//   createTask,
//   getTask,
//   getTaskInfo,
//   getTaskPlans,
//   editTask,
//   promoteTask,
//   demoteTask,
// } = require("../controllers/taskController");

// const {} = require('../controllers/planController');

// const {} = require('../controllers/taskController');

// routes relating to app
router
  .route("/app/createApp")
  .post(isAuthenticated, isAuthRole("pl"), createApp);
router.route("/app/showAllApps").get(isAuthenticated, getAllApp);
router.route("/app/showApp").post(isAuthenticated, getApp);
router.route("/app/editApp").post(isAuthenticated, editApp);

//routes relating to plan
router.route("/app/plan/createPlan").post(isAuthenticated, createPlan);
router.route("/app/plan/getAllPlans").get(isAuthenticated, getAllPlans);
router.route("/app/plan/getPlan").get(isAuthenticated, getPlan);
router.route("/app/plan/getPlanNames").get(isAuthenticated, getPlanNames);
router.route("/app/plan/editPlan").post(isAuthenticated, editPlan);

//routes relating to tasks
router.route("/checkPerms").post(isAuthenticated, checkPermissions);
router.route("/auditTrail").get(testAuditTrail);
router.route("/app/task/create").post(isAuthenticated, createTask);
router.route("/app/tasks/all").post(isAuthenticated, getTask);
router.route("/app/task/getTask").post(isAuthenticated, getTaskInfo);
router.route("/app/task/getPlans").post(isAuthenticated, getTaskPlans);
router.route("/app/task/editTask").post(isAuthenticated, editTask);
router.route("/app/task/promoteTask").post(isAuthenticated, promoteTask);
router.route("/app/task/demoteTask").post(isAuthenticated, demoteTask);

router.route("/api/CreateTask").post(CreateTask);
router.route("/api/GetTaskByState").post(GetTaskByState);
router.route("/api/PromoteTask2Done").post(PromoteTask2Done);

module.exports = router;
