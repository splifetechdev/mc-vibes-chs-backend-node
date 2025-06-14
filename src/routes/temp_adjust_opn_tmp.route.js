const router = require("express").Router();
const AdjustTempOpnTmpController = require("../controllers/temp_adjust_opn_tmp.controller");

router.get("/:id", AdjustTempOpnTmpController.getAll);
router.get("/getAllByID/:id", AdjustTempOpnTmpController.getAllByID);
router.get("/get/All", AdjustTempOpnTmpController.getAlldata);
router.post("/", AdjustTempOpnTmpController.create);
router.put("/:id", AdjustTempOpnTmpController.update);

router.get("/TestData/All", AdjustTempOpnTmpController.TestData);

router.get("/getListAll/list", AdjustTempOpnTmpController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  AdjustTempOpnTmpController.getListByCompany
);
router.get("/get/All/:id", AdjustTempOpnTmpController.getAlldatabycompany);
router.delete("/:id", AdjustTempOpnTmpController.delete);

module.exports = router;
