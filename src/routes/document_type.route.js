const router = require("express").Router();
const document_typeController = require("../controllers/document_type.controller");

router.get("/getByid/:id", document_typeController.findById);
router.get("/getAll", document_typeController.getAll);
router.post("/", document_typeController.create);
router.put("/:id", document_typeController.update);
router.delete("/:id", document_typeController.delete);

module.exports = router;
