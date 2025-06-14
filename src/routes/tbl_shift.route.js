const router = require("express").Router();
const tbl_shiftController = require("../controllers/tbl_shift.controller");

router.get("/:id", tbl_shiftController.getAll);
router.get("/getAllByID/:id/:u_define_id", tbl_shiftController.getAllByID);
router.post("/", tbl_shiftController.create);
router.put("/:id", tbl_shiftController.update);
router.delete("/:id", tbl_shiftController.delete);

module.exports = router;
