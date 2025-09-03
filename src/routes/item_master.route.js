const router = require("express").Router();
const item_masterController = require("../controllers/item_master.controller");

router.get("/:id", item_masterController.getAll);
router.get("/getAllByID/:id/:u_define_id", item_masterController.getAllByID);
router.get("/getAllByItemGroup/:id", item_masterController.getAllByItemGroup);
router.get("/get/All", item_masterController.getAlldata);
router.post("/", item_masterController.create);
router.put("/:id", item_masterController.update);
router.get("/get/All/:id", item_masterController.getAlldatabycompany);
router.delete('/:id', item_masterController.delete);
router.post("/import_item_master", item_masterController.import_item_master);

module.exports = router;
