const router = require("express").Router();
const tbl_routingController = require("../controllers/tbl_routing.controller");

router.get("/:id", tbl_routingController.getAll);
router.get("/findroutingByID/:id", tbl_routingController.findroutingByID);
router.get(
  "/getRoutingWorkOrder/:item_master_id/:company_id",
  tbl_routingController.getRoutingWorkOrder
);
router.get(
  "/findAllgroupby/:id",
  tbl_routingController.findtbl_routingAllgroupby
);
router.get("/getAllByID/:id/:u_define_id", tbl_routingController.getAllByID);
router.post("/searchbyitem_rtg", tbl_routingController.searchbyitem_rtg);
router.post("/", tbl_routingController.create);
router.put("/:id", tbl_routingController.update);
router.delete("/:id/:u_define_module_id", tbl_routingController.delete);
router.get("/getItemhavestd_cost/:item_master_id/:company_id", tbl_routingController.getItemhavestd_cost);
// router.get("/checkdata/:item_master_id/:rtg_id/:company_id/:opn_id", tbl_routingController.checkvalidaterouting);
router.post("/import_routing", tbl_routingController.import_routing);
module.exports = router;
