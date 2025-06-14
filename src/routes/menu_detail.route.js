const router = require("express").Router();
const menuDetailController = require("../controllers/menu_detail.controller");

router.get("/get", menuDetailController.getAll);
router.get("/getalldgm", menuDetailController.getAllDetailGroupMenu);
router.get("/getLast1MenuDetail", menuDetailController.getLast1MenuDetail);
router.post("/", menuDetailController.create);
router.put("/:id", menuDetailController.update);
router.delete("/:id", menuDetailController.delete);

module.exports = router;
