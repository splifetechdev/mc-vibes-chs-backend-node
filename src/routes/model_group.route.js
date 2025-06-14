const router = require("express").Router();
const ModelGroupController = require("../controllers/model_group.controller");

router.get("/:id", ModelGroupController.getAll);
router.get("/getAllByID/:id", ModelGroupController.getAllByID);
router.get("/get/All", ModelGroupController.getAlldata);
router.post("/", ModelGroupController.create);
router.put("/:id", ModelGroupController.update);

router.get("/getListAll/list", ModelGroupController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  ModelGroupController.getListByCompany
);
router.get("/get/All/:id", ModelGroupController.getAlldatabycompany);
router.delete("/:id", ModelGroupController.delete);

module.exports = router;
