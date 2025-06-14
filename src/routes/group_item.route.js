const router = require("express").Router();
const GroupItemController = require("../controllers/group_item.controller");

router.get("/:id", GroupItemController.getAll);
router.get("/getAllByID/:id", GroupItemController.getAllByID);
router.get("/get/All", GroupItemController.getAlldata);
router.post("/", GroupItemController.create);
router.put("/:id", GroupItemController.update);

router.get("/getListAll/list", GroupItemController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  GroupItemController.getListByCompany
);
router.get("/get/All/:id", GroupItemController.getAlldatabycompany);
router.delete("/:id", GroupItemController.delete);

module.exports = router;
