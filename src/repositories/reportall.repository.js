const db = require("../db/models");

exports.findAll = async () => await db.tbl_reportall.findAll();
exports.findAll_By_CompanyID = async (company_id) =>
  await db.tbl_reportall.findAll({
    where: {
      company_id: company_id,
    },
  });

exports.findOne = async () => await db.tbl_reportall.findOne()

exports.create = async (data) => await db.tbl_reportall.create(data);

exports.update = async (id, data) =>
  await db.tbl_reportall.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_reportall.destroy({
    where: {
      id,
    },
  });


  exports.cloth_registration_mch = async (sql) =>
    await db.sequelize.query(
      `${sql}`,
      {
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    exports.cloth_registration_sum = async (sql) =>
      await db.sequelize.query(
        `${sql}`,
        {
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      
      exports.cloth_registration_detail = async (sql) =>
        await db.sequelize.query(
          `${sql}`,
          {
            type: db.sequelize.QueryTypes.SELECT,
          }
        );
    