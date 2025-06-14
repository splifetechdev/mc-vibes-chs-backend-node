const HolidayMachineService = require("../services/holiday_mch.service");

exports.getAll = async (req, res) =>
  res.json(await HolidayMachineService.findAll(req.params.id));

exports.getHolidayMchByHolidayID = async (req, res) =>
  res.json(
    await HolidayMachineService.findHolidayMchByHolidayID(req.params.holiday_id)
  );

exports.getMchByWcg = async (req, res) =>
  res.json(await HolidayMachineService.findMchByWcg(req.params.wcg_id));

exports.getAllByID = async (req, res) =>
  res.json(
    await HolidayMachineService.findAllByID(
      req.params.id,
      req.params.u_define_id
    )
  );

exports.create = async (req, res) =>
  res.json(await HolidayMachineService.create(req.body));

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await HolidayMachineService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await HolidayMachineService.delete(req.params.holiday_id));
};
