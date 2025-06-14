const router = require("express").Router();
const tbl_sheftController = require("../controllers/tbl_sheft.controller");

router.get("/getAll", tbl_sheftController.getAll);
router.get("/:id", tbl_sheftController.findById);
router.post("/", tbl_sheftController.create);
router.put("/:id", tbl_sheftController.update);
router.delete("/:id", tbl_sheftController.delete);

module.exports = router;
