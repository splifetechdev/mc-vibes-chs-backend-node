const tbl_mch_service = require("../services/tbl_mch.service");

exports.getAll = async (req, res) =>
  res.json(await tbl_mch_service.find_all(req.params.company_id));

exports.getAllMchToAdjustPOByCompany = async (req, res) =>
  res.json(
    await tbl_mch_service.findAllMchToAdjustPOByCompany(req.params.company_id)
  );

exports.get_mch_adjust_list = async (req, res) =>
  res.json(await tbl_mch_service.find_mch_adjust_list(req.params.company_id));

exports.get_by_id = async (req, res) =>
  res.json(
    await tbl_mch_service.find_by_id(
      req.params.mch_id,
      req.params.u_define_module_id
    )
  );

exports.get_machine_by_id = async (req, res) => {
  res.json(await tbl_mch_service.find_machine_by_id(req.params.mch_id));
};

exports.findByWorkcenterId = async (req, res) =>
  res.json(await tbl_mch_service.findByWorkcenterId(req.params.work_center_id));

exports.create = async (req, res) => {
  try {
    const result = await tbl_mch_service.create(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await tbl_mch_service.update(req.params.mch_id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await tbl_mch_service.delete(req.params.mch_id));
};

exports.getdataganttchart = async (req, res) => {
  if (req.body.typesearch == "Month") {
    res.json(
      await tbl_mch_service.getdataganttchart(
        req.params.work_center_id,
        req.body
      )
    );
  } else {
    res.json(
      await tbl_mch_service.getdataganttchartday(
        req.params.work_center_id,
        req.body
      )
    );
  }
};
