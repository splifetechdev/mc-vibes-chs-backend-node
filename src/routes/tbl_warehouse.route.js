const router = require("express").Router();
const tbl_warehouseController = require("../controllers/tbl_warehouse.controller");

router.get("/getAll", tbl_warehouseController.getAll);
router.get("/:id", tbl_warehouseController.findById);
router.post("/", tbl_warehouseController.create);
router.put("/:id", tbl_warehouseController.update);
router.delete("/:id", tbl_warehouseController.delete);

module.exports = router;
