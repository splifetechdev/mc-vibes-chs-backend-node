const sectionService = require("../services/section.service");


exports.getAll = async (req, res) =>
  res.json(await sectionService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await sectionService.findAllByID(req.params.id));


exports.getAlldata = async (req, res) =>
  res.json(await sectionService.getAlldata());

exports.create = async (req, res) =>
  res.json(await sectionService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await sectionService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await sectionService.getAlldatabycompany(req.params.id));

  exports.delete = async (req, res) => {
    res.json(await sectionService.delete(req.params.id));
}
