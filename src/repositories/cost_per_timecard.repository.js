const db = require("../db/models");

exports.create = async (data) => await db.cost_per_timecard.create(data);

exports.update = async (id, data) =>
  await db.cost_per_timecard.update(data, {
    where: {
      id: id,
    },
  });

  
   exports.updatemanywhere = async (data) =>
        await db.sequelize.query(
          ` UPDATE [cost_per_timecard] SET [act_labor]=${data.act_labor} WHERE [timecard_detail_id] = ${data.timecard_detail_id} AND [opn_ord_id] = ${data.opn_ord_id} AND [timecard_date] = '${data.timecard_date}'`,
          { type: db.sequelize.QueryTypes.SELECT,}
        );

        
    exports.deletebydate = async (date) =>
      await db.sequelize.query(
        `DELETE FROM cost_per_timecard WHERE timecard_date = '${date}';`,
        { type: db.sequelize.QueryTypes.SELECT,}
      );
   