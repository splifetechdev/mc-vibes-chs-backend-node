const router = require("express").Router();
const doc_runningController = require("../controllers/doc_running.controller");

router.get("/getByid/:id", doc_runningController.findById);
router.get("/getAll", doc_runningController.getAll);
router.get("/getAllByGroupPD", doc_runningController.getAllByGroupPD);
router.get("/getAllDocGroup", doc_runningController.getAllDocGroup)
router.get('/:doc_group_name', doc_runningController.getByDocGroupName)
router.post("/", doc_runningController.create);
router.put("/:id", doc_runningController.update);
router.delete("/:id", doc_runningController.delete);

module.exports = router;
