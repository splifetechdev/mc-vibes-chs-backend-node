const router = require("express").Router();
const tbl_locationController = require("../controllers/tbl_location.controller");

router.get("/getAll", tbl_locationController.getAll);
router.get("/:id", tbl_locationController.findById);
router.post("/", tbl_locationController.create);
router.put("/:id", tbl_locationController.update);
router.delete("/:id", tbl_locationController.delete);

module.exports = router;
