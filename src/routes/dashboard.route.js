const router = require("express").Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get("/", dashboardController.get);
router.get("/downtime", dashboardController.getDowntime);
router.get("/target", dashboardController.getAvailabilityTarget);
router.get("/monthly", dashboardController.getByMonth);
router.get("/productivity", dashboardController.getPerformanceDashboard);
router.get(
  "/productivity/monthly",
  dashboardController.getMonthlyPerformanceDashboard
);
router.get(
  "/productivity/target",
  dashboardController.getPerformanceDailyWithTarget
);
router.get(
  "/productivity/work-center",
  dashboardController.getWorkCenterPerformanceDashboard
);
router.get("/quality", dashboardController.getQualityDashboardData);
router.get("/quality/daily", dashboardController.getQualityDailyDashboardData);
router.get(
  "/quality/work_center/defect",
  dashboardController.getDefectByWorkCenter
);
router.get(
  "/quality/item_group",
  dashboardController.getQualityDashboardByItemGroup
);

router.get("/quality/item", dashboardController.getQualityDashboardByItem);

router.get("/quality/defect", dashboardController.getTop10Defect);

router.get("/OEE", dashboardController.getOEEData);

router.get("/OEE/daily", dashboardController.getOEEDailyData);

module.exports = router;
