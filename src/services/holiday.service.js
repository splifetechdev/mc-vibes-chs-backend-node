const HolidayRepository = require("../repositories/holiday.repository");

exports.findAll = async (id) =>
  await HolidayRepository.findHolidayAll(id);

exports.findHolidayAndName = async (id) =>
  await HolidayRepository.findHolidayAndName(id);

exports.findAllByID = async (id, u_define_id) =>
  await HolidayRepository.findHolidayAllByID(id, u_define_id);

exports.findListAll = async () => await HolidayRepository.findListAll();

exports.findListByCompany = async (company_id) =>
  await HolidayRepository.findListByCompany(company_id);
exports.getAlldata = async (id) => await HolidayRepository.getAlldata(id);

exports.create = async (data) => await HolidayRepository.create(data);

exports.update = async (id, data) =>
  await HolidayRepository.update(id, data);

exports.getAlldatabycompany = async (id) =>
  await HolidayRepository.getAlldatabycompany(id);

exports.delete = async (id) => await HolidayRepository.delete(id);
