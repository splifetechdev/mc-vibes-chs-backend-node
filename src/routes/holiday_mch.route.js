const router = require("express").Router();
const HolidayMachineController = require("../controllers/holiday_mch.controller");

router.get("/:id", HolidayMachineController.getAll);
router.get(
  "/getHolidayMchByHolidayID/:holiday_id",
  HolidayMachineController.getHolidayMchByHolidayID
);
router.get("/getMchByWcg/:wcg_id", HolidayMachineController.getMchByWcg);
router.get("/getAllByID/:id/:u_define_id", HolidayMachineController.getAllByID);
router.post("/", HolidayMachineController.create);
router.put("/:id", HolidayMachineController.update);
router.delete("/:holiday_id", HolidayMachineController.delete);

module.exports = router;
