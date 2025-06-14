const router = require("express").Router();
const TempOpnTmpController = require("../controllers/temp_opn_tmp.controller");

router.get("/:id", TempOpnTmpController.getAll);
router.get("/getAllByID/:id", TempOpnTmpController.getAllByID);
router.get("/get/All", TempOpnTmpController.getAlldata);
router.post("/", TempOpnTmpController.create);
router.put("/:id", TempOpnTmpController.update);

router.get("/TestData/All", TempOpnTmpController.TestData);

router.get("/getListAll/list", TempOpnTmpController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  TempOpnTmpController.getListByCompany
);
router.get("/get/All/:id", TempOpnTmpController.getAlldatabycompany);
router.delete("/:id", TempOpnTmpController.delete);

module.exports = router;
