const router = require("express").Router();
const TempOrderController = require("../controllers/temp_order.controller");

router.get("/:id", TempOrderController.getAll);
router.get("/getAllByID/:id/:u_define_id", TempOrderController.getAllByID);
router.post("/", TempOrderController.create);
router.put("/:id", TempOrderController.update);
router.delete("/:id", TempOrderController.delete);

module.exports = router;
