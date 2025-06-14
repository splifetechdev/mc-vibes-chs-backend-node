const router = require("express").Router();
const settingGroupMenuController = require("../controllers/setting_group_menu.controller");

router.get("/get", settingGroupMenuController.getAll);
router.post("/", settingGroupMenuController.create);
router.put("/:id", settingGroupMenuController.update);
router.delete("/:id", settingGroupMenuController.delete);
router.get("/deleteMenuCache", settingGroupMenuController.deleteMenuCache);

module.exports = router;
