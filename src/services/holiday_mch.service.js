const HolidayMachineRepository = require("../repositories/holiday_mch.repository");

exports.findAll = async (id) =>
  await HolidayMachineRepository.findHolidayMachineAll(id);

exports.findHolidayMchByHolidayID = async (holiday_id) =>
  await HolidayMachineRepository.findHolidayMchByHolidayID(holiday_id);

exports.findMchByWcg = async (wcg_id) =>
  await HolidayMachineRepository.findMchByWcg(wcg_id);

exports.findAllByID = async (id, u_define_id) =>
  await HolidayMachineRepository.findHolidayMachineAllByID(id, u_define_id);

exports.create = async (data) => await HolidayMachineRepository.create(data);

exports.update = async (id, data) =>
  await HolidayMachineRepository.update(id, data);

exports.delete = async (holiday_id) =>
  await HolidayMachineRepository.delete(holiday_id);
