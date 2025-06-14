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

exports.findAll = async () => await db.tbl_setting_group_menu.findAll();

exports.create = async (data) => await db.tbl_setting_group_menu.create(data);

exports.update = async (id, data) =>
  await db.tbl_setting_group_menu.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_setting_group_menu.destroy({
    where: {
      id,
    },
  });

exports.deleteMenuCache = async () =>
  await db.sequelize.query(
    `delete  from tbl_setting_menu_detail
            where id in (select id from tbl_setting_menu_detail
                          where menu_detail_id not in (SELECT  id
                            FROM tbl_config_menu_detail))
    `,
    {
      type: db.sequelize.QueryTypes.DELETE,
    }
  );
