const ProductionOrderTempService = require("../services/production_order_tmp.service");
const DraftProdOrderPlanService = require("../services/production_order_draft.service");
const doc_runningService = require("../services/doc_running.service");

exports.getAll = async (req, res) =>
  res.json(await ProductionOrderTempService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await ProductionOrderTempService.findAllByID(req.params.id));

exports.getListAll = async (req, res) => {
  var tmpObject = [];

  const res_position = await ProductionOrderTempService.findListAll();

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

    // console.log(x);
    // console.log(x.name);
    tmpSubObject.id = x.id;
    tmpSubObject.name = x.name;
    tmpSubObject.companyId = x.companyId;
    tmpSubObject.createdAt = x.createdAt;
    tmpSubObject.updatedAt = x.updatedAt;
    // console.log("tmpSubObject: ", JSON.stringify(tmpSubObject));
    tmpObject.push(tmpSubObject);
  });

  return res.status(200).json(tmpObject);
};

exports.getListByCompany = async (req, res) => {
  var tmpObject = [];

  const res_position = await ProductionOrderTempService.findListByCompany(
    req.params.company_id
  );

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

    // console.log(x);
    // console.log(x.name);
    tmpSubObject.id = x.id;
    tmpSubObject.name = x.name;
    tmpSubObject.companyId = x.companyId;
    tmpSubObject.createdAt = x.createdAt;
    tmpSubObject.updatedAt = x.updatedAt;
    // console.log("tmpSubObject: ", JSON.stringify(tmpSubObject));
    tmpObject.push(tmpSubObject);
  });

  return res.status(200).json(tmpObject);
};
exports.getAlldata = async (req, res) =>
  res.json(await ProductionOrderTempService.getAlldata());

exports.TestData = async (req, res) => {
  // {
  //     "doc_module_name": "PD ceramic",
  //     "item_master_id": 10,
  //     "order_qty": "1000",
  //     "rtg_id": "01",
  //     "order_date": "2024-01-30",
  //     "due_date": "2024-02-29",
  //     "due_time": "16:00:00",
  //     "company_id": "1",
  //     "user_create": "2",
  //     "created_at": "2024-01-30"
  // }

  let doc_group_name = null;
  let doc_module_name = "PD ceramic";

  let doc_running = "PDCM-240238";
  let rtg_id = "01";
  let item_master_id = "10";
  let opn_id = "200";

  const res_doc = await doc_runningService.findGroupByModule(doc_module_name);

  console.log("res_doc: ", JSON.stringify(res_doc));

  // await ProductionOrderTempService.findALLByRouting(
  //   doc_running,
  //   rtg_id,
  //   item_master_id
  // );

  doc_group_name = res_doc[0].doc_group_name;
  console.log("doc_group_name: ", doc_group_name);

  return res.json(res_doc);

  // for (let i = 0; i < 10; i++) {
  //   if (i == 5) {
  //     break;
  //   }
  //   console.log("TestData: ", i);
  // }
};

function BatchOrder(QtyOrder, QtyPer, QtyBy, Scrap, NoMch, Batch) {
  let bo = 0;
  if (Batch == 0) {
    Batch = 1;
  }

  if (QtyPer == 0) {
    QtyPer = 1;
  }
  if (QtyBy == 0) {
    QtyBy = 1;
  }

  Scrap = ScrapPercentage(Scrap);

  bo = (((QtyOrder * QtyPer) / QtyBy) * Scrap) / NoMch / Batch;
  // bo = (((1000 * QtyPer) / QtyBy) * Scrap) / NoMch / Batch;

  // console.log("QtyOrder: ", QtyOrder);
  // console.log("QtyPer: ", QtyPer);
  // console.log("QtyBy: ", QtyBy);
  // console.log("Scrap: ", Scrap);
  // console.log("NoMch: ", NoMch);
  // console.log("Batch: ", Batch);
  // console.log("BatchOrder bo: ", Math.ceil(bo));

  return Math.ceil(bo);
  // return (((QtyOrder * QtyPer) / QtyBy) * Scrap) / NoMch / Batch;
}

function ScrapPercentage(scrap) {
  let scrap_per = 0;

  scrap_per = 1 + scrap / 100;

  return scrap_per;
}

exports.create = async (req, res) =>
  res.json(await ProductionOrderTempService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await ProductionOrderTempService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await ProductionOrderTempService.getAlldatabycompany(req.params.id));

exports.delete = async (req, res) => {
  res.json(await ProductionOrderTempService.delete(req.params.id));
};
