const router = require("express").Router();
const departmentController = require("../controllers/department.controller");

router.get("/:id", departmentController.getAll);
router.get("/getAllByID/:id", departmentController.getAllByID);
router.get("/get/All", departmentController.getAlldata);
router.post("/", departmentController.create);
router.put("/:id", departmentController.update);

router.get("/getListAll/list", departmentController.getListAll);
router.get(
  "/getListByCompany/:company_id",
  departmentController.getListByCompany
);
router.get("/get/All/:id", departmentController.getAlldatabycompany);
router.delete('/:id', departmentController.delete)

module.exports = router;
