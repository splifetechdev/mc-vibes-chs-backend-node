const ModelGroupService = require("../services/model_group.service");

exports.getAll = async (req, res) =>
  res.json(await ModelGroupService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await ModelGroupService.findAllByID(req.params.id));

exports.getListAll = async (req, res) => {
  var tmpObject = [];

  const res_position = await ModelGroupService.findListAll();

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

  const res_position = await ModelGroupService.findListByCompany(
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
  res.json(await ModelGroupService.getAlldata());

exports.create = async (req, res) =>
  res.json(await ModelGroupService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await ModelGroupService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await ModelGroupService.getAlldatabycompany(req.params.id));

exports.delete = async (req, res) => {
  res.json(await ModelGroupService.delete(req.params.id));
};
