const router = require("express").Router();
const OrderController = require("../controllers/order.controller");

router.get("/:id", OrderController.getAll);
router.get("/getAllByOrdId/:id", OrderController.getAllByOrdId);

router.post("/getOrderByQuery/:id", OrderController.getOrderByQuery);

router.get(
  "/findIdByDocRunning/:doc_running/:id",
  OrderController.findIdByDocRunning
);

router.get(
  "/findAdjustPlanDraftByDocRunning/:doc_running",
  OrderController.findAdjustPlanDraftByDocRunning
);

router.get("/getAllByID/:id/:u_define_id", OrderController.getAllByID);
router.post("/", OrderController.create);
router.put("/:id", OrderController.update);
router.delete("/:id", OrderController.delete);

module.exports = router;
