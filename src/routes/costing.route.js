const router = require("express").Router();
const ProductionOrderController = require("../controllers/costing.controller");

router.post(
  "/searchByV_ORD_costing",
  ProductionOrderController.searchByV_ORD_costing
);

router.post(
  "/runcostbymanual",
  ProductionOrderController.runcostbymanual
);

router.post(
  "/SearchORDCostingDetailH",
  ProductionOrderController.SearchORDCostingDetailH
);

router.post(
  "/SearchORDCostingDetailD",
  ProductionOrderController.SearchORDCostingDetailD
);

module.exports = router;
