const router = require("express").Router();
const divisionController = require("../controllers/division.controller");

router.get("/:id", divisionController.getAll);
router.get("/getAllByID/:id", divisionController.getAllByID);
router.get("/getAllByDepartment/:id", divisionController.getAllByDepartment);
router.get("/get/All", divisionController.getAlldata);
router.post("/", divisionController.create);
router.put("/:id", divisionController.update);
router.get("/get/All/:id", divisionController.getAlldatabycompany);
router.delete('/:id', divisionController.delete)

module.exports = router;
