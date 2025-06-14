const db = require("../db/models");

exports.findAll = async () => await db.tbl_config_group_menu.findAll();

exports.create = async (data) => await db.tbl_config_group_menu.create(data);

exports.update = async (id, data) =>
  await db.tbl_config_group_menu.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_config_group_menu.destroy({
    where: {
      id,
    },
  });
