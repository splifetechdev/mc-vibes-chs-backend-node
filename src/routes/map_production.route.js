const router = require("express").Router();
const map_productionController = require("../controllers/map_production.controller");

router.get("/:id", map_productionController.getAll);
router.post("/findmap_productionAllProductivity", map_productionController.findmap_productionAllProductivity);
router.post("/findmap_productionAllDownTime", map_productionController.findmap_productionAllDownTime);
router.post("/", map_productionController.create);
router.put("/updateAll", map_productionController.update);
router.delete("/:id", map_productionController.delete);

module.exports = router;
