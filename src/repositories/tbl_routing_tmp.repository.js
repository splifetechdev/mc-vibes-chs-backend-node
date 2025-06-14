const db = require("../db/models");

exports.getPONewMachine = async (company_id) =>
  await db.sequelize.query(
    `SELECT CONCAT(id,':',work_center_id,':',company_id) as  id, CONCAT(machine_id,':',name) as f_mch_name 
      from tbl_mch
      WHERE company_id = ${company_id} and is_active = 1`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getPONewMachineName = async (company_id) =>
  await db.sequelize.query(
    `SELECT CONCAT(mch.id,':',wc_name) as  id, CONCAT(machine_id,':',name) as f_mch_name 
      from tbl_mch mch
      left join tbl_work_center wc
      on mch.work_center_id = wc.id
      WHERE mch.company_id = ${company_id} and is_active = 1`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getMainRoutingByItemAndRtgId = async (
  item_master_id,
  rtg_id,
  company_id
) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_routing where item_master_id = ${item_master_id} and rtg_id = '${rtg_id}' and company_id = ${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getMainRoutingById = async (id) =>
  await db.sequelize.query(`SELECT * FROM tbl_routing where id = ${id}`, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.getRoutingTmpNewByRtgMainId = async (rtg_main_id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_routing_tmp_new where rtg_main_id = ${rtg_main_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getRoutingTmpById = async (id) =>
  await db.sequelize.query(`SELECT * FROM tbl_routing_tmp where uid = ${id}`, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.saveRoutingTmpNew = async (data) => {
  //await db.tbl_routing_tmp_new.create(data);

  try {
    return await db.tbl_routing_tmp_new.create(data);
  } catch (error) {
    console.log(`saveRoutingTmpNew error: ${JSON.stringify(error)}`);
    return error;
  }
};

exports.deleteRoutingTmpNew = async (id) =>
  await db.tbl_routing_tmp_new.destroy({
    where: {
      rtg_main_id: id,
    },
  });

exports.saveRoutingTmp = async (data) => {
  // await db.tbl_routing_tmp.create(data);
  data.uid = data.id;
  // console.log(`saveRoutingTmp data: ${JSON.stringify(data)}`);

  try {
    return await db.tbl_routing_tmp.create(data);
  } catch (error) {
    console.log(`saveRoutingTmp error: ${JSON.stringify(error)}`);
    return error;
  }
};

exports.deleteRoutingTmp = async (id) =>
  await db.tbl_routing_tmp.destroy({
    where: {
      uid: id,
    },
  });

exports.findById = async (id) =>
  await db.sequelize.query(`SELECT * FROM tbl_routing_tmp where id=${id}`, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.findRoutingTmpAll = async (id) =>
  await db.sequelize.query(`SELECT * FROM tbl_routing_tmp `, {
    type: db.sequelize.QueryTypes.SELECT,
  });

exports.create = async (data) => await db.tbl_routing_tmp.create(data);

exports.update = async (id, data) =>
  await db.tbl_routing_tmp.update(data, {
    where: {
      id: id,
    },
  });

exports.findSystemId = async () =>
  await db.sequelize.query(
    "SELECT TOP 1 c.id FROM tbl_routing_tmp c  ORDER BY c.id DESC ",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_routing_tmp.destroy({
    where: {
      id: id,
    },
  });

exports.updateMainRouting = async (id, data) => {
  try {
    return await db.sequelize.query(
      `update tbl_routing set no_of_machine='${data.no_of_machine}',machine_id='${data.machine_id}' where id = ${id}`,
      {
        type: db.sequelize.QueryTypes.UPDATE,
      }
    );
  } catch (error) {
    console.log(`updateMainRouting error: ${JSON.stringify(error)}`);
    return error;
  }
};
