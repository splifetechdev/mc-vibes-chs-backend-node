const router = require("express").Router();
const sectionController = require("../controllers/section.controller");

router.get("/:id", sectionController.getAll);
router.get("/getAllByID/:id", sectionController.getAllByID);
router.get("/get/All", sectionController.getAlldata);
router.post("/", sectionController.create);
router.put("/:id", sectionController.update);
router.get("/get/All/:id", sectionController.getAlldatabycompany);
router.delete('/:id', sectionController.delete)

module.exports = router;
