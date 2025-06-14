const db = require("../db/models");

exports.findAllDetailGroupMenu = async () =>
  await db.sequelize.query(
    `SELECT tbl_config_menu_detail.id As id,
    tbl_config_menu_detail.cmd_name,
    tbl_config_menu_detail.cmd_route,
    tbl_config_menu_detail.group_menu_id,
    tbl_config_group_menu.cgm_name 
    FROM tbl_config_menu_detail 
    left join tbl_config_group_menu 
    on tbl_config_group_menu.id = tbl_config_menu_detail.group_menu_id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findLast1MenuDetail = async () =>
  await db.sequelize.query(
    `SELECT TOP 1 * FROM tbl_config_menu_detail order by id desc`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAll = async () => await db.tbl_config_menu_detail.findAndCountAll();

exports.create = async (data) => await db.tbl_config_menu_detail.create(data);

exports.createMenuDetailAndSettingDetail = async (data) => {
  const t = await db.sequelize.transaction();
  var rt_transaction;
  try {
    // insert menu_detail
    // await db.tbl_config_menu_detail.create(data, { transaction: t });
    await db.tbl_config_menu_detail.create(data);

    // get last id menu_detail
    const last_menu_detail_id = await db.sequelize.query(
      `SELECT TOP 1 * FROM tbl_config_menu_detail order by id desc`,
      {
        type: db.sequelize.QueryTypes.SELECT,
      },
      { transaction: t }
    );

    console.log("last_menu_detail_id:", JSON.stringify(last_menu_detail_id));

    // get tbl_setting_group_menu
    const tbl_setting_group_menu = await db.sequelize.query(
      `SELECT id FROM tbl_setting_group_menu`,
      {
        type: db.sequelize.QueryTypes.SELECT,
      },
      { transaction: t }
    );
    // console.log(
    //   "tbl_setting_group_menu:",
    //   JSON.stringify(tbl_setting_group_menu)
    // );

    // for loop tbl_setting_group_menu

    for (let i = 0; i < tbl_setting_group_menu.length; i++) {
      // console.log(
      //   "tbl_setting_group_menu[i].id:",
      //   JSON.stringify(tbl_setting_group_menu[i].id)
      // );

      // insert setting_menu_detail
      // await db.tbl_config_setting_menu_detail.create(
      //   {
      //     setting_group_menu_id: tbl_setting_group_menu[i].id,
      //     group_menu_id: last_menu_detail_id[0].group_menu_id,
      //     menu_detail_id: last_menu_detail_id[0].id,
      //     user_create: last_menu_detail_id[0].last_menu_detail_id,
      //     user_update: last_menu_detail_id[0].last_menu_detail_id,
      //     created_at: new Date(),
      //     updated_at: new Date(),
      //   },
      //   { transaction: t }
      // );

      let tmp_data = {
        setting_group_menu_id: tbl_setting_group_menu[i].id,
        group_menu_id: last_menu_detail_id[0].group_menu_id,
        menu_detail_id: last_menu_detail_id[0].id,
        user_create: last_menu_detail_id[0].user_create,
        user_update: last_menu_detail_id[0].user_create,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db.tbl_setting_menu_detail.create(tmp_data, { transaction: t });
    }

    await t.commit();
    rt_transaction = { save_sta: true, save_msg: "save success" };
  } catch (error) {
    await t.rollback();
    // console.log("error rollback:", error.toString());
    rt_transaction = { save_sta: false, save_msg: error.toString() };
  }
  return rt_transaction;
};

exports.update = async (id, data) =>
  await db.tbl_config_menu_detail.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_config_menu_detail.destroy({
    where: {
      id,
    },
  });
