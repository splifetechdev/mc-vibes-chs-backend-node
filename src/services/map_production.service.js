const map_productionRepository = require("../repositories/map_production.repository");

exports.findAll = async (data) => await map_productionRepository.findmap_productionAll(data);

exports.findmap_productionAllProductivity = async (data) => await map_productionRepository.findmap_productionAllProductivity(data);

exports.findmap_productionAllDownTime = async (data) => await map_productionRepository.findmap_productionAllDownTime(data);


exports.create = async (data) => await map_productionRepository.create(data);

exports.update = async (id, data) => await map_productionRepository.update(id, data);


exports.delete = async (id) => await map_productionRepository.delete(id);
