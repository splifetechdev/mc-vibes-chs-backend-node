const db = require("../db/models");

exports.findById = async (id) =>
  await db.sequelize.query(`SELECT * from doc_running where id = :id`, {
    replacements: { id },
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.findOne = async (id) =>
  await db.doc_running.findOne({
    where: {
      id,
    },
  });
exports.findGroupByModule = async (module) =>
  await db.sequelize.query(`SELECT * from doc_running where module = :module`, {
    replacements: { module },
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.findAllByGroupPD = async () =>
  await db.sequelize.query(
    `SELECT * from doc_running where doc_group_name = 'PD'`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findByGroupName = async (doc_group_name, company_id) =>
  await db.doc_running.findAll({
    where: {
      doc_group_name: doc_group_name,
    },
  });

exports.findAll = async () => await db.doc_running.findAll();

exports.create = async (data) => await db.doc_running.create(data);

exports.update = async (id, data) =>
  await db.doc_running.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.doc_running.destroy({
    where: {
      id,
    },
  });

exports.findByModuleName = async (module) =>
  await db.doc_running.findOne({
    where: {
      module,
      status: "A",
    },
  });
