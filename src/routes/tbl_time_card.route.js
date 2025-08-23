const router = require("express").Router();
const tbl_time_card_controller = require("../controllers/tbl_time_card.controller");

router.get("/company/:company_id", tbl_time_card_controller.list);
router.get("/own", tbl_time_card_controller.list_own);
router.get("/time-card-detail", tbl_time_card_controller.get_time_card_detail);
router.get(
  "/time-card-detail/:log_id/receive-qty",
  tbl_time_card_controller.get_detail_receive_qty
);
router.get(
  "/time-card-detail/machine/:mch_id/running-opn",
  tbl_time_card_controller.getRunningOpnByMachine
);
router.get(
  "/shift/:shift_id/report",
  tbl_time_card_controller.get_time_card_report
);
router.get("/:tc_id/log", tbl_time_card_controller.get_time_card_log);
router.get("/work_order/option", tbl_time_card_controller.listWorkOrderOptions);
router.get(
  "/opn-ord/company/:company_id",
  tbl_time_card_controller.listOperationOrdOptions
);
router.get("/opn-ord/:opn_ord_id", tbl_time_card_controller.get_ord_by_id);
router.get("/:tc_id/:u_define_module_id", tbl_time_card_controller.get_one);

router.post("/", tbl_time_card_controller.create);
router.post(
  "/time-card-detail/:log_id/end",
  tbl_time_card_controller.end_time_card_detail
);
router.post("/:tc_id/post", tbl_time_card_controller.post_time_card);
router.post("/:tc_id/post-v2", tbl_time_card_controller.post_time_card_v2);

router.post("/:tc_id/post-job", tbl_time_card_controller.post_job);
router.post("/:tc_id/log", tbl_time_card_controller.upsert_log);
router.post(
  "/:tc_id/log/:log_id/defect",
  tbl_time_card_controller.bulk_upsert_log_defect
);
router.delete("/:tc_id", tbl_time_card_controller.remove_time_card);
router.delete(
  "/deletedetail/:tc_id",
  tbl_time_card_controller.remove_time_card_detail
);
router.delete("/:tc_id/log/:log_id", tbl_time_card_controller.remove_log);
router.delete(
  "/:tc_id/log/:log_id/defect/:id",
  tbl_time_card_controller.remove_defect
);

router.post(
  "/get/getdeletejobbycompany",
  tbl_time_card_controller.getdeletejobbycompany
);
router.get(
  "/get/list_doc_running_no_option/:company_id",
  tbl_time_card_controller.list_doc_running_no_option
);
router.get(
  "/time_card/work_order/option/:company_id",
  tbl_time_card_controller.listtimecardWorkOrderOptions
);
router.post(
  "/createforiotmapping",
  tbl_time_card_controller.createforiotmapping
);

router.get(
  "/time_card_detail/check_opn_id_ues/:opn_id",
  tbl_time_card_controller.time_card_detail_check_opn_id_ues
);

module.exports = router;
