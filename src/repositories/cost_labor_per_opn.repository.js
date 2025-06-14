const db = require("../db/models");

exports.create = async (data) => await db.cost_labor_per_opn.create(data);

exports.update = async (id, data) =>
  await db.cost_labor_per_opn.update(data, {
    where: {
      id: id,
    },
  });

    exports.deletebydate = async (date) =>
      await db.sequelize.query(
        `DELETE FROM cost_labor_per_opn WHERE tc_date = '${date}';`,
        { type: db.sequelize.QueryTypes.SELECT,}
      );
