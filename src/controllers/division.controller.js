const divisionService = require("../services/division.service");


exports.getAll = async (req, res) =>
  res.json(await divisionService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await divisionService.findAllByID(req.params.id));

  exports.getAllByDepartment = async (req, res) =>
  res.json(await divisionService.getAllByDepartment(req.params.id));


exports.getAlldata = async (req, res) =>
  res.json(await divisionService.getAlldata());

exports.create = async (req, res) =>
  res.json(await divisionService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await divisionService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await divisionService.getAlldatabycompany(req.params.id));

  exports.delete = async (req, res) => {
    res.json(await divisionService.delete(req.params.id));
}
