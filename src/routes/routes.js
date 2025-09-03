const router = require("express").Router();
const jwt = require("../configs/jwt");

router.use("/products", jwt.verifyToken, require("./product.route"));
router.use("/account", require("./account.route"));
router.use("/worker", require("./tbl_worker.route"));

router.use("/group-menu", require("./group_menu.route"));
router.use("/menu-detail", require("./menu_detail.route"));
router.use("/setting-group-menu", require("./setting_group_menu.route"));
router.use("/setting-menu-detail", require("./setting_menu_detail.route"));

router.use("/doc_running", require("./doc_running.route"));
router.use("/document_type", require("./document_type.route"));

router.use("/department", require("./department.route"));
router.use("/company", require("./company.route"));
router.use("/position", require("./position.route"));
router.use("/division", require("./division.route"));
router.use("/section", require("./section.route"));

router.use("/group-item", require("./group_item.route"));
router.use("/unit", require("./unit.route"));
router.use("/dim-group", require("./dim_group.route"));
router.use("/item-type", require("./item_type.route"));
router.use("/model-group", require("./model_group.route"));
router.use("/work-center-group", require("./work_center_group.route"));
router.use("/work-center", require("./work_center.route"));
router.use("/downtime-cause", require("./downtime_cause.route"));
router.use("/kpi-master", require("./kpi_master.route"));
router.use("/kpi-title", require("./kpi_title.route"));
router.use("/holiday", require("./holiday.route"));
router.use("/holiday-mch", require("./holiday_mch.route"));

router.use("/production-order", require("./production_order.route"));
router.use("/order", require("./order.route.js"));
router.use("/production-order-tmp", require("./production_order_tmp.route"));
router.use(
  "/production-order-draft",
  require("./production_order_draft.route")
);

router.use("/temp-order", require("./temp_order.route.js"));
router.use("/temp-opn-tmp", require("./temp_opn_tmp.route"));
router.use("/temp-opn-ord", require("./temp_opn_ord.route"));

router.use("/temp-adjust-opn-tmp", require("./temp_adjust_opn_tmp.route"));
router.use("/temp-adjust-opn-ord", require("./temp_adjust_opn_ord.route"));

router.use("/version", require("./version.route"));

router.use("/u_define_master", require("./u_define_master.route"));
router.use("/item_master", require("./item_master.route"));
router.use("/u_define_module", require("./u_define_module.route"));

router.use("/defect_cause", require("./tbl_defect_cause.route"));
router.use("/shift", require("./tbl_shift.route"));
router.use("/machine", require("./tbl_mch.route"));
router.use("/plc_mapping_machine", require("./tbl_plc_mapping_machine.route"));
router.use("/routing", require("./tbl_routing.route"));
router.use("/time-card", require("./tbl_time_card.route"));
router.use("/time-card-defect", require("./tbl_time_card_log_defect.route.js"));
router.use("/job", require("./job.route"));
router.use("/map-production", require("./map_production.route.js"));
router.use("/dashboard", require("./dashboard.route"));
router.use("/ord_recieve", require("./tbl_ord_receive.route"));

router.use("/receive-from-po", require("./receive_from_po.route"));

router.use("/warehouse", require("./tbl_warehouse.route"));
router.use("/location", require("./tbl_location.route"));
router.use("/sheft", require("./tbl_sheft.route"));

router.use("/routing_tmp", require("./tbl_routing_tmp.route"));
router.use("/report_all", require("./reportall.route"));

router.use("/costing", require("./costing.route"));


router.use("/shift_ot", require("./tbl_shift_ot.route"));

module.exports = router;
