const router = require("express").Router();
const RoutingTmpController = require("../controllers/tbl_routing_tmp.controller");

router.put("/updateMainRouting/:id", RoutingTmpController.updateMainRouting);

router.get(
  "/getPONewMachine/:company_id",
  RoutingTmpController.getPONewMachine
);

router.get(
  "/getPONewMachineName/:company_id",
  RoutingTmpController.getPONewMachineName
);

router.get(
  "/getMainRoutingByItemAndRtgId/:item_master_id/:rtg_id/:company_id",
  RoutingTmpController.getMainRoutingByItemAndRtgId
);

router.get(
  "/getRoutingTmpNewByRtgMainId/:rtg_main_id",
  RoutingTmpController.getRoutingTmpNewByRtgMainId
);

router.get("/getRoutingTmpById/:id", RoutingTmpController.getRoutingTmpById);

router.post("/saveRoutingTmp", RoutingTmpController.saveRoutingTmp);

router.delete("/deleteRoutingTmp/:id", RoutingTmpController.deleteRoutingTmp);

router.post("/saveRoutingTmpNew", RoutingTmpController.saveRoutingTmpNew);

router.delete(
  "/deleteRoutingTmpNew/:id",
  RoutingTmpController.deleteRoutingTmpNew
);

router.get("/getAll", RoutingTmpController.getAll);
router.get("/:id", RoutingTmpController.findById);
router.post("/", RoutingTmpController.create);
router.put("/:id", RoutingTmpController.update);
router.delete("/:id", RoutingTmpController.delete);

module.exports = router;
