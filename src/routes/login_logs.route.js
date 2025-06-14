const router = require("express").Router();
const loginLogsController = require("../controllers/login_logs.controller");

router.get("/get", loginLogsController.getAll);
router.post("/", loginLogsController.create);
router.put("/:id", loginLogsController.update);
router.delete("/:id", loginLogsController.delete);

module.exports = router;
