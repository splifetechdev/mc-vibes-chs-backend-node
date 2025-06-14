const router = require("express").Router();
const versionController = require("../controllers/version.controller");

router.get("/get", versionController.getAll);
router.get("/get_By_CompanyID/:id", versionController.getAll_By_CompanyID);
router.post("/", versionController.create);
router.put("/:id", versionController.update);
router.delete("/:id", versionController.delete);

module.exports = router;
