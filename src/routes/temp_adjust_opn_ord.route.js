const router = require("express").Router();
const AdjustTempOpnOrdController = require("../controllers/temp_adjust_opn_ord.controller");

router.get("/:id", AdjustTempOpnOrdController.getAll);
router.get("/getAllByID/:id", AdjustTempOpnOrdController.getAllByID);

// doc_running, rtg_id, item_master_id;
router.get(
  "/getProdOrderPlanByID/:doc_running/:rtg_id/:item_master_id",
  AdjustTempOpnOrdController.getProdOrderPlanByID
);

router.get("/get/All", AdjustTempOpnOrdController.getAlldata);
router.post("/", AdjustTempOpnOrdController.create);
router.put("/:id", AdjustTempOpnOrdController.update);

router.get("/getListAll/list", AdjustTempOpnOrdController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  AdjustTempOpnOrdController.getListByCompany
);
router.get("/get/All/:id", AdjustTempOpnOrdController.getAlldatabycompany);
router.delete("/:id", AdjustTempOpnOrdController.delete);

module.exports = router;
