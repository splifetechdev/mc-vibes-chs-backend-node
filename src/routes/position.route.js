const router = require("express").Router();
const positionController = require("../controllers/position.controller");

router.get("/:id", positionController.getAll);

router.get("/get/list", positionController.getAllPosition);

router.get("/getListAll/list", positionController.getListAll);

router.post("/add", positionController.create);

router.put("/update/:id", positionController.update);

module.exports = router;
