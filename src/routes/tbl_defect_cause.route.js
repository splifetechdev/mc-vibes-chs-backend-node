const router = require("express").Router();
const defect_causeController = require("../controllers/tbl_defect_cause.controller");

router.get("/:id", defect_causeController.getAll);
router.get("/getAllByID/:id/:u_define_id", defect_causeController.getAllByID);
router.post("/", defect_causeController.create);
router.put("/:id", defect_causeController.update);
router.delete("/:id", defect_causeController.delete);
router.post("/import_defect_cause", defect_causeController.import_defect_cause);

module.exports = router;
