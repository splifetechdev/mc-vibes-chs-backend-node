const router = require("express").Router();
const tbl_ord_receiveController = require("../controllers/tbl_ord_receive.controller");

router.get("/getAll", tbl_ord_receiveController.getAll);

router.get("/getByord_id/:id", tbl_ord_receiveController.findById);

router.post("/", tbl_ord_receiveController.create);

router.put("/:id", tbl_ord_receiveController.update);

router.delete("/:id", tbl_ord_receiveController.delete);

module.exports = router;
