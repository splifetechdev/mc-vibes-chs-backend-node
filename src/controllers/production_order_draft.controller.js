const DraftProdOrderPlanService = require("../services/production_order_draft.service");

exports.getAll = async (req, res) =>
  res.json(await DraftProdOrderPlanService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await DraftProdOrderPlanService.findAllByID(req.params.id));

exports.getDataCheckBatchForAddNewOPN = async (req, res) =>
  res.json(
    await DraftProdOrderPlanService.getDataCheckBatchForAddNewOPN(
      req.params.doc_running_no,
      req.params.rtg_id,
      req.params.item_master_id,
      req.params.opn_id,
      req.params.batch_count
    )
  );

// doc_running, rtg_id, item_master_id;
exports.getProdOrderPlanByID = async (req, res) =>
  res.json(
    await DraftProdOrderPlanService.findProdOrderPlanByID(
      req.params.doc_running,
      req.params.rtg_id,
      req.params.item_master_id
    )
  );

exports.getProdOrderByMachine = async (req, res) => {
  const { company_id, machine_id } = req.params;
  try {
    const result =
      (await DraftProdOrderPlanService.findProdOrderByMachine(
        company_id,
        machine_id
      )) || [];
    res.status(200).send(
      result.map((opn_ord) => ({
        id: opn_ord.id,
        label: `OPN:${opn_ord.id} ${opn_ord.opn_name} WO:${opn_ord.doc_running_no}-Batch${opn_ord.batch_count}`,
        opn_desc: opn_ord.opn_name,
      }))
    );
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.listOperationOrdOptions = async (req, res) => {
  try {
    const { company_id } = req.params;
    const result = await tbl_time_card_service.list_opn_ord(company_id);
    res.status(200).send(
      result.map((opn_ord) => ({
        id: opn_ord.id,
        label: `OPN:${opn_ord.id} ${opn_ord.opn_name} WO:${opn_ord.doc_running_no}-Batch${opn_ord.batch_count}`,
        opn_desc: opn_ord.opn_name,
      }))
    );
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.getListAll = async (req, res) => {
  var tmpObject = [];

  const res_position = await DraftProdOrderPlanService.findListAll();

  // id;
  // name;
  // companyId;
  // user_create;
  // user_update;
  // created_at;
  // updated_at;

  res_position.forEach((x, index) => {
    var tmpSubObject = {
      name: "Account Manager",
      id: "5fa8c4e75f2f6e2f4b8d819c",
      companyId: "5fa8afec23c6dd2f52f00612",
      createdAt: "2020-11-09T04:26:15.927Z",
      updatedAt: "2021-01-08T07:45:39.742Z",
    };

    tmpSubObject.id = x.id;
    tmpSubObject.name = x.name;
    tmpSubObject.companyId = x.companyId;
    tmpSubObject.createdAt = x.createdAt;
    tmpSubObject.updatedAt = x.updatedAt;
    tmpObject.push(tmpSubObject);
  });

  return res.status(200).json(tmpObject);
};

exports.getListByCompany = async (req, res) =>
  res.json(
    await DraftProdOrderPlanService.findListByCompany(req.params.company_id)
  );

exports.getAlldata = async (req, res) =>
  res.json(await DraftProdOrderPlanService.getAlldata());

exports.create = async (req, res) =>
  res.json(await DraftProdOrderPlanService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await DraftProdOrderPlanService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.closeWorkOrder = async (req, res) => {
  try {
    res
      .status(201)
      .json(
        await DraftProdOrderPlanService.closeWorkOrder(
          req.params.doc_running_no,
          req.body
        )
      );
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.approveWorkOrder = async (req, res) => {
  try {
    res
      .status(201)
      .json(
        await DraftProdOrderPlanService.approveWorkOrder(
          req.params.doc_running_no,
          req.body
        )
      );
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await DraftProdOrderPlanService.getAlldatabycompany(req.params.id));

exports.delete = async (req, res) => {
  const { force } = req.query;
  res.json(await DraftProdOrderPlanService.delete(req.params.id, force));
};

exports.deleteOPNById = async (req, res) =>
  res.json(await DraftProdOrderPlanService.deleteOPNById(req.params.id));
