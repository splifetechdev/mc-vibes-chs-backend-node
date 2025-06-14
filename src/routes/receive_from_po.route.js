const router = require("express").Router();
const receive_from_poController = require("../controllers/receive_from_po.controller");

router.get(
  "/getReceiveAllByCompanyId/:company_id",
  receive_from_poController.getReceiveAllByCompanyId
);

router.get(
  "/getTimeCardReceiveAllById/:id",
  receive_from_poController.getTimeCardReceiveAllById
);

router.get(
  "/getReceiveAllByCompanyIdAndId/:company_id/:id",
  receive_from_poController.getReceiveAllByCompanyIdAndId
);

router.post("/saveReceivePO", receive_from_poController.saveReceivePO);

router.delete(
  "/deleteTimCardItem/:id/qty/:qty/time_card_id/:time_card_id/opn_ord_id/:opn_ord_id",
  receive_from_poController.deleteTimCardItem
);

router.get("/:id", receive_from_poController.findById);
router.post("/", receive_from_poController.create);
router.put("/:id", receive_from_poController.update);
router.delete("/:id", receive_from_poController.delete);
router.get(
  "/getReceivePODocIdPrefix/All",
  receive_from_poController.getReceivePODocIdPrefix
);
router.get("/getAll", receive_from_poController.getAll);

module.exports = router;
