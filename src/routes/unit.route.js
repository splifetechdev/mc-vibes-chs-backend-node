const router = require("express").Router();
const UnitController = require("../controllers/unit.controller");

router.get("/:id", UnitController.getAll);
router.get("/getAllByID/:id", UnitController.getAllByID);
router.get("/get/All", UnitController.getAlldata);
router.post("/", UnitController.create);
router.put("/:id", UnitController.update);

router.get("/getListAll/list", UnitController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  UnitController.getListByCompany
);
router.get("/get/All/:id", UnitController.getAlldatabycompany);
router.delete("/:id", UnitController.delete);

module.exports = router;
