const router = require("express").Router();
const companyController = require("../controllers/company.controller");

router.get("/getAll", companyController.getAll);
router.get("/:id", companyController.findById);
router.post("/", companyController.create);
router.put("/:id", companyController.update);

module.exports = router;
