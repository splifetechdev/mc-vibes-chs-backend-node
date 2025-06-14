const router = require("express").Router();
const ItemTypeController = require("../controllers/item_type.controller");

router.get("/:id", ItemTypeController.getAll);
router.get("/getAllByID/:id", ItemTypeController.getAllByID);
router.get("/get/All", ItemTypeController.getAlldata);
router.post("/", ItemTypeController.create);
router.put("/:id", ItemTypeController.update);

router.get("/getListAll/list", ItemTypeController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  ItemTypeController.getListByCompany
);
router.get("/get/All/:id", ItemTypeController.getAlldatabycompany);
router.delete("/:id", ItemTypeController.delete);

module.exports = router;
