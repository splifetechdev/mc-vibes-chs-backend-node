const router = require("express").Router();
const accountController = require("../controllers/account.controller");
const jwt = require("../configs/jwt");

router.post("/addUserAccount", accountController.addUserAccount);
router.put("/updateUserAccount/:id", accountController.updateUserAccount);
router.put("/deleteUserAccount/:id", accountController.updateUserAccount);

router.put("/replaceUserAccount1/:id", accountController.replaceUserAccount1);
router.put("/replaceUserAccount2/:id", accountController.replaceUserAccount2);
router.put("/replaceUserAccount3/:id", accountController.replaceUserAccount3);

router.get("/info", jwt.verifyToken, accountController.info);
router.get("/checkregister", accountController.checkregister);

router.get("/get", accountController.getAll);
router.get("/get/list", accountController.getAllList);
router.get("/get/listactive", accountController.getAllListActive);
router.get("/getByuserrole", accountController.getByuserrole);

router.put("/:id", accountController.update);
router.delete("/:id", accountController.delete);

router.get("/gettest", accountController.getTest);
router.get("/updatetest", accountController.updateTest);

router.get("/:id", accountController.getFindId);

router.get("/by/:id", accountController.getFindbyId);

router.get("/getMyProfile/:id", accountController.getMyProfile);

router.get("/getAuthorize/:id/:router_path", accountController.getAuthorize);

router.get("/getaccountbycompany/:id", accountController.getaccountByCompany);

router.post("/sendMailResetPassword", accountController.sendMailResetPassword);
router.get("/getUserByEmail/:email", accountController.getUserByEmail);
router.put("/resetPassword/:id", accountController.resetPassword);

router.post("/changeapprovaluser", accountController.changeapprovaluser);

router.post("/import_employee", accountController.import_employee);

module.exports = router;
