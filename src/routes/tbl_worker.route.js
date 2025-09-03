const router = require("express").Router();
const tbl_workerController = require("../controllers/tbl_worker.controller");

router.post("/addUserAccount", tbl_workerController.addUserAccount);

router.get("/get", tbl_workerController.getAll);

router.get("/getByCompany", tbl_workerController.getByCompany);

router.put("/:id", tbl_workerController.update);
router.delete("/:id", tbl_workerController.delete);

router.get("/:id", tbl_workerController.getFindId);

router.post("/changeapprovalworker", tbl_workerController.changeapprovalworker);

router.post("/check-in", tbl_workerController.checkIn);

router.post("/import_worker", tbl_workerController.import_worker);

module.exports = router;
