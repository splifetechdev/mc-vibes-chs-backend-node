const router = require("express").Router();
const ProductionOrderTempController = require("../controllers/production_order_tmp.controller");

router.get("/:id", ProductionOrderTempController.getAll);
router.get("/getAllByID/:id", ProductionOrderTempController.getAllByID);
router.get("/get/All", ProductionOrderTempController.getAlldata);
router.post("/", ProductionOrderTempController.create);
router.put("/:id", ProductionOrderTempController.update);

router.get("/TestData/All", ProductionOrderTempController.TestData);

router.get("/getListAll/list", ProductionOrderTempController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  ProductionOrderTempController.getListByCompany
);
router.get("/get/All/:id", ProductionOrderTempController.getAlldatabycompany);
router.delete("/:id", ProductionOrderTempController.delete);

module.exports = router;
