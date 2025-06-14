const tbl_mch_shift = require("../services/tbl_mch_shift.service");
const dayjs = require("dayjs");

exports.getAll = async (req, res) => {
  const machineShifts = await tbl_mch_shift.find_all(req.params.mch_id);
  const result = machineShifts.map((tbl_mch_shift) => {
    tbl_mch_shift.tbl_shift.start_time = dayjs(
      tbl_mch_shift.tbl_shift.start_time
    ).format("HH:mm:ss");
    tbl_mch_shift.tbl_shift.end_time = dayjs(
      tbl_mch_shift.tbl_shift.end_time
    ).format("HH:mm:ss");
    tbl_mch_shift.tbl_shift.break_start = dayjs(
      tbl_mch_shift.tbl_shift.break_start
    ).format("HH:mm:ss");
    tbl_mch_shift.tbl_shift.break_end = dayjs(
      tbl_mch_shift.tbl_shift.break_end
    ).format("HH:mm:ss");
    tbl_mch_shift.tbl_shift.summary_time = dayjs(
      tbl_mch_shift.tbl_shift.summary_time
    ).format("HH:mm:ss");
    return tbl_mch_shift;
  });
  res.json(result);
};

exports.get_by_id = async (req, res) =>
  res.json(await tbl_mch_shift.find_by_id(req.params.mch_id));

exports.create = async (req, res) => {
  try {
    const result = await tbl_mch_shift.create(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await tbl_mch_shift.update(req.params.mch_id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await tbl_mch_shift.delete(req.params.mch_id, req.params.shift_id));
};

exports.getMachineCostByID = async (req, res) =>
  res.json(await tbl_mch_shift.findMachineCostByID(req.params.id));
