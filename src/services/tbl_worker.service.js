const tbl_workerRepository = require("../repositories/tbl_worker.repository");

exports.add = async (data) => await tbl_workerRepository.add(data);

exports.update = async (id, data) =>
  await tbl_workerRepository.update(id, data);

exports.findAll = async () => await tbl_workerRepository.findAll();

exports.findByCompany = async (company_id) =>
  await tbl_workerRepository.findByCompany(company_id);

exports.delete = async (id) => await tbl_workerRepository.delete(id);

exports.findId = async (id) => await tbl_workerRepository.FindUserById(id);

exports.changeapprovallv1 = async (data) => {
  await tbl_workerRepository.changeapprovallv1(data);
};

exports.changeapprovallv2 = async (data) => {
  await tbl_workerRepository.changeapprovallv2(data);
};

exports.changeapprovallv3 = async (data) => {
  await tbl_workerRepository.changeapprovallv3(data);
};

exports.findByemp_id = async (emp_id,company_id) => await tbl_workerRepository.findByemp_id(emp_id,company_id);