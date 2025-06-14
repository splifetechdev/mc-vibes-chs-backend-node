const router = require("express").Router();
const ProductionOrderController = require("../controllers/production_order.controller");

router.get("/:id", ProductionOrderController.getAll);
router.get(
  "/getProductionOrderAndName/:id",
  ProductionOrderController.getProductionOrderAndName
);

router.get(
  "/getAllByID/:id/:u_define_id",
  ProductionOrderController.getAllByID
);
router.get("/get/All", ProductionOrderController.getAlldata);
router.get(
  "/machine/:machineId",
  ProductionOrderController.getMachineOpnByShift
);
router.post("/", ProductionOrderController.create);
router.post(
  "/saveProductionOrderDraft",
  ProductionOrderController.saveProductionOrderDraft
);

router.put(
  "/updateProductionOrderDraft/:id",
  ProductionOrderController.updateProductionOrderDraft
);

router.post(
  "/adjustProductionOrderByDueDateDraft/:id",
  ProductionOrderController.adjustProductionOrderByDueDateDraft
);

router.post(
  "/adjustProductionOrderByStartDateDraft/:id",
  ProductionOrderController.adjustProductionOrderByStartDateDraft
);

router.post(
  "/adjustPOChangeMchAllOPN/:id",
  ProductionOrderController.adjustPOChangeMchAllOPN
);

router.post(
  "/adjustPOChangeStartDateAllOPN/:id",
  ProductionOrderController.adjustPOChangeStartDateAllOPN
);

router.post(
  "/adjustAdjustBetweenConfirm/:doc_running",
  ProductionOrderController.adjustAdjustBetweenConfirm
);

router.post(
  "/adjustProductionOrderConfirm/:doc_running",
  ProductionOrderController.adjustProductionOrderConfirm
);

router.put("/:id", ProductionOrderController.update);

router.get("/getListAll/list", ProductionOrderController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  ProductionOrderController.getListByCompany
);
router.get("/get/All/:id", ProductionOrderController.getAlldatabycompany);
router.delete("/:id", ProductionOrderController.delete);
router.post(
  "/productionstatusreport",
  ProductionOrderController.productionstatusreport
);

router.put(
  "/putUpdateDockRunningNo/:doc_running",
  ProductionOrderController.putUpdateDockRunningNo
);

router.put("/updateTblOrd/:id", ProductionOrderController.updateTblOrd);

module.exports = router;
