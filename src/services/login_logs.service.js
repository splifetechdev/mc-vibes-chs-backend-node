const loginLogsRepository = require("../repositories/login_logs.repository");

exports.findAll = async () => await loginLogsRepository.findAll();

exports.create = async (data) => await loginLogsRepository.create(data);

exports.update = async (id, data) =>
  await loginLogsRepository.update(id, data);

exports.delete = async (id) => await loginLogsRepository.delete(id);
