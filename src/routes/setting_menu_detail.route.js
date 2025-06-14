const router = require("express").Router();
const settingMenuDetailController = require("../controllers/setting_menu_detail.controller");

router.get("/get", settingMenuDetailController.getAll);
router.get("/getcountbyid/:id", settingMenuDetailController.getCountById);
router.get(
  "/getlismenudetailbyid/:id",
  settingMenuDetailController.getListMenuDetailById
);
router.post("/", settingMenuDetailController.create);
router.put("/:id", settingMenuDetailController.update);
router.delete("/:id", settingMenuDetailController.delete);

module.exports = router;
