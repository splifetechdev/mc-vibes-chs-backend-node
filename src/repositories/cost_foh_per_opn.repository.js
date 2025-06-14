const db = require("../db/models");

exports.create = async (data) => await db.cost_foh_per_opn.create(data);

exports.update = async (id, data) =>
  await db.cost_foh_per_opn.update(data, {
    where: {
      id: id,
    },
  }); 

  exports.deletebydate = async (date) =>
    await db.sequelize.query(
      `DELETE FROM cost_foh_per_opn WHERE tcdate = '${date}';`,
      { type: db.sequelize.QueryTypes.SELECT,}
    );
