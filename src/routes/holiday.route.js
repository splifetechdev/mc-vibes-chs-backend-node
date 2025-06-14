const router = require("express").Router();
const HolidayController = require("../controllers/holiday.controller");

router.get("/:id", HolidayController.getAll);
router.get("/getHolidayAndName/:id", HolidayController.getHolidayAndName);

router.get("/getAllByID/:id/:u_define_id", HolidayController.getAllByID);
router.get("/get/All", HolidayController.getAlldata);
router.post("/", HolidayController.create);
router.put("/:id", HolidayController.update);

router.get("/getListAll/list", HolidayController.getListAll);
router.get("/getListByCompany/:company_id", HolidayController.getListByCompany);
router.get("/get/All/:id", HolidayController.getAlldatabycompany);
router.delete("/:id", HolidayController.delete);

module.exports = router;
