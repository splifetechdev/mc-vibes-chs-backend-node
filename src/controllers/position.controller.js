const positionService = require("../services/position.service");

exports.getAll = async (req, res) =>
  res.json(await positionService.findAll(req.params.id));

exports.getAllPosition = async (req, res) =>
  res.json(await positionService.getAllPosition());

exports.getListAll = async (req, res) => {
  var tmpObject = [];

  const res_position = await positionService.findListAll();

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
    tmpSubObject.createdAt = x.created_at;
    tmpSubObject.updatedAt = x.updated_at;
    // console.log("tmpSubObject: ", JSON.stringify(tmpSubObject));
    tmpObject.push(tmpSubObject);
  });

  return res.status(200).json(tmpObject);
};

exports.create = async (req, res) =>
  res.json(await positionService.create(req.body));

exports.update = async (req, res) => {
  try {
    res.status(201).json(await positionService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};
