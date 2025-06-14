const db = require("../db/models");

exports.findById = async (id) =>
  await db.sequelize.query(
    `SELECT * from document_type where id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAll = async () => await db.document_type.findAll();

exports.create = async (data) => await db.document_type.create(data);

exports.update = async (id, data) =>
  await db.document_type.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.document_type.destroy({
    where: {
      id,
    },
  });
