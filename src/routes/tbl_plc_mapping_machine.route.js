const router = require("express").Router();
const tbl_plc_mapping_machineController = require("../controllers/tbl_plc_mapping_machine.controller");

router.get("/:id", tbl_plc_mapping_machineController.getAll);
router.get("/getAllByID/:id/:u_define_id", tbl_plc_mapping_machineController.getAllByID);
router.post("/", tbl_plc_mapping_machineController.create);
router.put("/:id", tbl_plc_mapping_machineController.update);
router.delete("/:id", tbl_plc_mapping_machineController.delete);

module.exports = router;
