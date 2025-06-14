const db = require("../db/models");

exports.find_all = async (mch_id) =>
  await db.tbl_mch_shift.findAll({
    where: {
      machine_id: mch_id,
    },
    include: [
      {
        model: db.tbl_mch,
      },
      {
        model: db.tbl_shift,
      },
      {
        model: db.tbl_users,
      },
    ],
  });

exports.find_by_machine_id = async (machine_id) =>
  await db.tbl_mch_shift.findOne({
    where: {
      machine_id,
    },
    include: [
      {
        model: db.tbl_mch,
      },
      {
        model: db.tbl_shift,
      },
      {
        model: db.tbl_users,
      },
    ],
  });

exports.create = async (data) => await db.tbl_mch_shift.create(data);

exports.update = async (id, data) =>
  await db.tbl_mch_shift.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_mch_shift.destroy({
    where: {
      id: id,
    },
  });

exports.findMachineCostByID = async (id) =>
  await db.sequelize.query(
    `select m.id ,m.machine_id, wc.labor_rate,wc.foh_rate,wc.voh_rate 
            from tbl_mch m
            left join tbl_work_center wc
            on wc.id = m.work_center_id
            where m.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
