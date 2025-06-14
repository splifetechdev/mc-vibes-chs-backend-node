const db = require("../db/models");
// const dbquery = require("../db/db");

exports.findALldataV_FOH_per_opn = async (data) =>
  await db.sequelize.query(
    `SELECT * FROM V_FOH_per_opn
     WHERE tcdate='${data.date}'`,
    { type: db.sequelize.QueryTypes.SELECT,}
  );

  exports.findALldataV_Labor_per_opn = async (data) =>
    await db.sequelize.query(
      `SELECT * FROM V_Labor_per_opn
       WHERE tcdate='${data.date}'`,
      { type: db.sequelize.QueryTypes.SELECT,}
    );

    exports.findALldataV_FOH_cost_detail = async (data) =>
      await db.sequelize.query(
        `SELECT * FROM V_FOH_cost_detail
         WHERE tcdate_start='${data.date}'`,
        { type: db.sequelize.QueryTypes.SELECT,}
      );

      exports.findALldataV_Labor_cost_detail = async (data) =>
        await db.sequelize.query(
          `SELECT * FROM V_Labor_cost_detail
           WHERE tcdate_start='${data.date}'`,
          { type: db.sequelize.QueryTypes.SELECT,}
        );

    exports.searchByV_ORD_costing = async (sql) =>
      await db.sequelize.query(
        `${sql}`,
        { type: db.sequelize.QueryTypes.SELECT,}
      );


      exports.SearchORDCostingDetailH = async (doc_running_no) =>
        await db.sequelize.query(
          `SELECT * FROM V_ORD_costing_detail_H
           WHERE doc_running_no='${doc_running_no}'`,
          { type: db.sequelize.QueryTypes.SELECT,}
        );

        exports.SearchORDCostingDetailD = async (doc_running_no) =>
          await db.sequelize.query(
            `SELECT * FROM V_ORD_costing_detail
             WHERE doc_running_no='${doc_running_no}'`,
            { type: db.sequelize.QueryTypes.SELECT,}
          );