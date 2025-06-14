const router = require("express").Router();
const TempOpnOrdController = require("../controllers/temp_opn_ord.controller");

router.get("/:id", TempOpnOrdController.getAll);
router.get("/getAllByID/:id", TempOpnOrdController.getAllByID);

// doc_running, rtg_id, item_master_id;
router.get(
  "/getProdOrderPlanByID/:doc_running/:rtg_id/:item_master_id",
  TempOpnOrdController.getProdOrderPlanByID
);

router.get("/get/All", TempOpnOrdController.getAlldata);
router.post("/", TempOpnOrdController.create);
router.put("/:id", TempOpnOrdController.update);

router.get("/getListAll/list", TempOpnOrdController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  TempOpnOrdController.getListByCompany
);
router.get("/get/All/:id", TempOpnOrdController.getAlldatabycompany);
router.delete("/:id", TempOpnOrdController.delete);

module.exports = router;
