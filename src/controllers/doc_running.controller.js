const doc_runningService = require("../services/doc_running.service");

exports.findById = async (req, res) =>
  res.json(await doc_runningService.findById(req.params.id));

exports.findGroupByModule = async (req, res) =>
  res.json(await doc_runningService.findGroupByModule(req.params.module));

exports.getAll = async (req, res) =>
  res.json(await doc_runningService.findAll());

exports.getAllByGroupPD = async (req, res) =>
  res.json(await doc_runningService.findAllByGroupPD());

exports.getByDocGroupName = async (req, res) => {
  try {
    const { requester_company_id } = req;
    const { doc_group_name } = req.params;
    res.json(
      await doc_runningService.findByGroupName(
        doc_group_name,
        requester_company_id
      )
    );
  } catch (error) {
    res.sendStatus(500).send({ error: error.message });
  }
};

exports.getAllDocGroup = async (req, res) => {
  try {
    const docRunning = await doc_runningService.findAll();
    const docGroups = docRunning.reduce((acc, cur) => {
      if (acc.includes(cur.doc_group_name)) {
        return acc;
      } else {
        return [...acc, cur.doc_group_name];
      }
    }, []);
    res.json(docGroups);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    return res.status(201).json(await doc_runningService.create(req.body));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) =>
  res.json(await doc_runningService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await doc_runningService.delete(req.params.id));
