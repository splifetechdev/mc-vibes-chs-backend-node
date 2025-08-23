const router = require("express").Router();
const shiftOTController = require("../controllers/shift_ot.controller");

router.get("/get", shiftOTController.getAll);
router.get(
  "/getShiftOTByShiftID/:shift_id",
  shiftOTController.getShiftOTByShiftID
);
router.post("/", shiftOTController.create);
router.put("/:id", shiftOTController.update);
router.delete("/:id", shiftOTController.delete);

module.exports = router;
