const groupMenuRepository = require("../repositories/group_menu.repository");

exports.findAll = async () => await groupMenuRepository.findAll();

exports.create = async (data) => await groupMenuRepository.create(data);

exports.update = async (id, data) => await groupMenuRepository.update(id, data);

exports.delete = async (id) => await groupMenuRepository.delete(id);
