const router = require("express").Router();
const DimGroupController = require("../controllers/dim_group.controller");

router.get("/:id", DimGroupController.getAll);
router.get("/getAllByID/:id", DimGroupController.getAllByID);
router.get("/get/All", DimGroupController.getAlldata);
router.post("/", DimGroupController.create);
router.put("/:id", DimGroupController.update);

router.get("/getListAll/list", DimGroupController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  DimGroupController.getListByCompany
);
router.get("/get/All/:id", DimGroupController.getAlldatabycompany);
router.delete("/:id", DimGroupController.delete);

module.exports = router;
