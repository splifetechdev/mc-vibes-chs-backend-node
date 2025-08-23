const db = require("../db/models");

exports.findAll = async () => await db.tbl_shift_ot.findAll();

exports.findByShiftID = async (shift_id) =>
  await db.tbl_shift_ot.findAll({
    where: {
      shift_id: shift_id,
    },
  });

exports.create = async (data) => await db.tbl_shift_ot.create(data);

exports.update = async (id, data) =>
  await db.tbl_shift_ot.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_shift_ot.destroy({
    where: {
      id,
    },
  });
