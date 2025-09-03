const tbl_mch_repository = require("../repositories/tbl_mch.repository");

exports.find_all = async (company_id) =>
  await tbl_mch_repository.find_all(company_id);

exports.findAllMchToAdjustPOByCompany = async (company_id) =>
  await tbl_mch_repository.findAllMchToAdjustPOByCompany(company_id);

exports.find_mch_adjust_list = async (company_id) =>
  await tbl_mch_repository.find_mch_adjust_list(company_id);

// exports.findAllByID = async (id, u_define_id) =>
//   await tbl_mch_repository.findtbl_shiftAllByID(id, u_define_id);
exports.find_by_id = async (id, u_define_module_id) =>
  await tbl_mch_repository.find_by_id(id, u_define_module_id);

exports.find_by_id_getname = async (id) => {
  return await tbl_mch_repository.find_by_id_getname(id);
};

exports.find_machine_by_id = async (mch_id) => {
  return await tbl_mch_repository.find_machine_by_id(mch_id);
};

exports.findByWorkcenterId = async (work_center_id) =>
  await tbl_mch_repository.findByWorkcenterId(work_center_id);

exports.create = async (data) => {
  const machine = await tbl_mch_repository.find_by_company_id_and_machine_id(
    data.company_id,
    data.machine_id
  );
  if (machine) {
    throw new Error(
      `Existing machine:${data.machine_id} company:${data.company_id}`
    );
  }
  return await tbl_mch_repository.create(data);
};

exports.update = async (id, data) => await tbl_mch_repository.update(id, data);

exports.delete = async (id) => await tbl_mch_repository.delete(id);

exports.getdataganttchart = async (work_center_id, data) =>
  await tbl_mch_repository.getdataganttchart(work_center_id, data);

exports.getdataganttchartday = async (work_center_id, data) =>
  await tbl_mch_repository.getdataganttchartday(work_center_id, data);

exports.findBy_MachineID = async (machine_id,company_id) => await tbl_mch_repository.findBy_MachineID(machine_id,company_id);

