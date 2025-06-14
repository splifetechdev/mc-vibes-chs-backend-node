const router = require("express").Router();
const tbl_time_card_detail_defect_controller = require("../controllers/tbl_time_card_detail_defect.controller");

router.post("/", tbl_time_card_detail_defect_controller.upsert);

module.exports = router;
