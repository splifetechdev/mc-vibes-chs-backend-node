const db = require("../db/models");

exports.findAll = async () => await db.tbl_version.findAll();
exports.findAll_By_CompanyID = async (company_id) =>
  await db.tbl_version.findAll({
    where: {
      company_id: company_id,
    },
  });

exports.findOne = async () => await db.tbl_version.findOne()

exports.create = async (data) => await db.tbl_version.create(data);

exports.update = async (id, data) =>
  await db.tbl_version.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_version.destroy({
    where: {
      id,
    },
  });
