const router = require("express").Router();
const groupMenuController = require("../controllers/group_menu.controller");

router.get("/get", groupMenuController.getAll);
router.post("/", groupMenuController.create);
router.put("/:id", groupMenuController.update);
router.delete("/:id", groupMenuController.delete);

module.exports = router;
