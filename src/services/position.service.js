const positionRepository = require("../repositories/position.repository");

exports.findAll = async (id) => await positionRepository.findPositionAll(id);

exports.getAllPosition = async () => await positionRepository.getAllPosition();

exports.findListAll = async () => await positionRepository.findListAll();

exports.create = async (data) => await positionRepository.create(data);

exports.update = async (id, data) => await positionRepository.update(id, data);

exports.findByname = async (name,company_id) => await positionRepository.findByname(name,company_id);
