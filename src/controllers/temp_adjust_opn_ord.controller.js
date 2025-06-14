const AdjustTempOpnOrdService = require("../services/temp_adjust_opn_ord.service");

exports.getAll = async (req, res) =>
  res.json(await AdjustTempOpnOrdService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await AdjustTempOpnOrdService.findAllByID(req.params.id));

// doc_running, rtg_id, item_master_id;
exports.getProdOrderPlanByID = async (req, res) =>
  res.json(
    await AdjustTempOpnOrdService.findProdOrderPlanByID(
      req.params.doc_running,
      req.params.rtg_id,
      req.params.item_master_id
    )
  );

exports.getListAll = async (req, res) => {
  var tmpObject = [];

  const res_position = await AdjustTempOpnOrdService.findListAll();

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

exports.getListByCompany = async (req, res) =>
  res.json(await AdjustTempOpnOrdService.findListByCompany(req.params.company_id));

exports.getAlldata = async (req, res) =>
  res.json(await AdjustTempOpnOrdService.getAlldata());

exports.create = async (req, res) =>
  res.json(await AdjustTempOpnOrdService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await AdjustTempOpnOrdService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await AdjustTempOpnOrdService.getAlldatabycompany(req.params.id));

exports.delete = async (req, res) => {
  const { force } = req.query;
  res.json(await AdjustTempOpnOrdService.delete(req.params.id, force));
};
