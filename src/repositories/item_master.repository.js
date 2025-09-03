const db = require("../db/models");
// const dbquery = require("../db/db");

exports.finditem_masterAll = async (id) =>
  await db.sequelize.query(
    `SELECT m.*,g.group_item,g.group_name,u.unit_name 
    FROM item_master m
    LEFT JOIN tbl_group_item g ON  m.item_group_id=g.id
    LEFT JOIN tbl_unit u ON  m.unit_id=u.id
    WHERE m.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.finditem_masterAllByID = async (id,u_define_id) =>
  await db.sequelize.query(
    `SELECT m.*,udm.* ,g.group_item,g.group_name,u.unit_name,location.id as lc_id,warehouse.id as wh_id
    FROM item_master m
    LEFT JOIN u_define_master udm ON  m.id=udm.module_master_id
    and udm.u_define_module_id = :u_define_id
    LEFT JOIN tbl_group_item g ON  m.item_group_id=g.id
    LEFT JOIN tbl_unit u ON  m.unit_id=u.id
    LEFT JOIN tbl_sheft sheft ON  m.sheft_id=sheft.id
    LEFT JOIN tbl_location location ON  sheft.lc_id=location.id
    LEFT JOIN tbl_warehouse warehouse ON  sheft.wh_id=warehouse.id
    WHERE m.id = :id`,
    {
      replacements: { id, u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

  exports.getAllByItemGroup = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM item_master
     WHERE item_master.item_group_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.code as item_master_code,d.department_id,
    d.company_id,c.code AS company_code,d.name  AS item_master_name,c.name_th AS company_name,c.status 
    FROM item_master d 
    LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.item_master.create(data);

exports.update = async (id, data) =>
  await db.item_master.update(data, {
    where: {
      id: id,
    },
  });

  exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT u.*,g.name as u_define_group_name
    FROM item_master u 
    LEFT JOIN u_define_group g ON d.u_define_group_id = g.id
    WHERE u.u_define_group_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


  exports.delete = async (id) => await db.item_master.destroy({
    where: {
        id: id
    }
});

  exports.findByitem_masterID = async (item_id,company_id) =>
  await db.item_master.findOne({
    where: {
      item_id:item_id,
      company_id:company_id,
    },
  });