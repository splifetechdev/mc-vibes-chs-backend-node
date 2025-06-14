const router = require("express").Router();
const DraftProdOrderPlanController = require("../controllers/production_order_draft.controller");

router.get("/:id", DraftProdOrderPlanController.getAll);
router.get("/getAllByID/:id", DraftProdOrderPlanController.getAllByID);

router.get(
  "/getDataCheckBatchForAddNewOPN/:doc_running_no/:rtg_id/:item_master_id/:opn_id/:batch_count",
  DraftProdOrderPlanController.getDataCheckBatchForAddNewOPN
);

// doc_running, rtg_id, item_master_id;
router.get(
  "/getProdOrderPlanByID/:doc_running/:rtg_id/:item_master_id",
  DraftProdOrderPlanController.getProdOrderPlanByID
);
router.get(
  "/getProdOrderByMachine/:company_id/:machine_id",
  DraftProdOrderPlanController.getProdOrderByMachine
);
router.get("/get/All", DraftProdOrderPlanController.getAlldata);
router.post("/", DraftProdOrderPlanController.create);
router.put("/:id", DraftProdOrderPlanController.update);
router.put(
  "/closeWorkOrder/:doc_running_no",
  DraftProdOrderPlanController.closeWorkOrder
);

router.put(
  "/approveWorkOrder/:doc_running_no",
  DraftProdOrderPlanController.approveWorkOrder
);

router.get("/getListAll/list", DraftProdOrderPlanController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  DraftProdOrderPlanController.getListByCompany
);
router.get("/get/All/:id", DraftProdOrderPlanController.getAlldatabycompany);
router.delete("/:id", DraftProdOrderPlanController.delete);

router.delete("/deleteOPNById/:id", DraftProdOrderPlanController.deleteOPNById);

module.exports = router;
