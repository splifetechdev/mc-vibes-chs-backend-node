const router = require("express").Router();
const tbl_mch_controller = require("../controllers/tbl_mch.controller");
const tbl_mch_shift_controller = require("../controllers/tbl_mch_shift.controller");

router.get("/:mch_id/shift", tbl_mch_shift_controller.getAll);
router.post("/:mch_id/shift", tbl_mch_shift_controller.create);
router.delete("/:mch_id/shift/:shift_id", tbl_mch_shift_controller.delete);
router.get("/company/:company_id", tbl_mch_controller.getAll);
router.get("/:mch_id/:u_define_module_id", tbl_mch_controller.get_by_id);
router.get("/:mch_id", tbl_mch_controller.get_machine_by_id);
router.post("/", tbl_mch_controller.create);
router.put("/:mch_id", tbl_mch_controller.update);
router.delete("/:mch_id", tbl_mch_controller.delete);
router.post(
  "/getbycworkcenterid/:work_center_id",
  tbl_mch_controller.findByWorkcenterId
);

router.get(
  "/getAllMchToAdjustPOByCompany/:company_id/adjustPO",
  tbl_mch_controller.getAllMchToAdjustPOByCompany
);

router.get(
  "/get_mch_adjust_list/:company_id",
  tbl_mch_controller.get_mch_adjust_list
);

router.get(
  "/getMachineCostByID/:id",
  tbl_mch_shift_controller.getMachineCostByID
);

router.post(
  "/getdataganttchart/:work_center_id",
  tbl_mch_controller.getdataganttchart
);

router.post("/import_mch", tbl_mch_controller.import_mch);

module.exports = router;
