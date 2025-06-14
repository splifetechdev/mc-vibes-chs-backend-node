const db = require("../db/models");

exports.findListMenuDetailById = async (id) =>
  await db.sequelize.query(
    `SELECT tbl_setting_menu_detail.id as id,
        tbl_setting_group_menu.sgm_name,
        tbl_config_group_menu.cgm_name,
        tbl_config_menu_detail.cmd_name,
        tbl_config_menu_detail.cmd_route,
        smd_view,smd_add,smd_edit,smd_del
        FROM tbl_setting_menu_detail 
        left join tbl_setting_group_menu 
        on tbl_setting_group_menu.id = tbl_setting_menu_detail.setting_group_menu_id
        left join tbl_config_group_menu
        on tbl_setting_menu_detail.group_menu_id = tbl_config_group_menu.id
        left join tbl_config_menu_detail
        on tbl_setting_menu_detail.menu_detail_id = tbl_config_menu_detail.id
        WHERE tbl_setting_menu_detail.setting_group_menu_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAll = async () => await db.tbl_setting_menu_detail.findAll();

exports.findCountById = async (id) =>
  await db.tbl_setting_menu_detail.findAndCountAll({
    where: {
      setting_group_menu_id: id,
    },
  });

exports.create = async (data) => await db.tbl_setting_menu_detail.create(data);

exports.update = async (id, data) =>
  await db.tbl_setting_menu_detail.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_setting_menu_detail.destroy({
    where: {
      id,
    },
  });
