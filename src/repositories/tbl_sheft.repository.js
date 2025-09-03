const db = require("../db/models");

exports.findById = async (id) =>
  await db.sequelize.query(
    `SELECT * , concat(shf_id,':',sf_name) as fsf_name FROM tbl_sheft where lc_id='${id}'`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findtbl_sheftAll = async (id) =>
  await db.sequelize.query(
    `SELECT shf.*,lc_name,wh_name FROM tbl_sheft shf
        left join tbl_location lc 
        on shf.lc_id = lc.id
        left join tbl_warehouse wh
        on shf.wh_id = wh.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => {
  try {
    return await db.tbl_sheft.create(data);
  } catch (error) {
    console.log(`sheft create error:`, error);
    return error;
  }
};

exports.update = async (id, data) =>
  await db.tbl_sheft.update(data, {
    where: {
      shf_id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_sheft.destroy({
    where: {
      shf_id: id,
    },
  });

exports.findSystemId = async () =>
  await db.sequelize.query(
    "SELECT TOP 1 c.id FROM tbl_sheft c  ORDER BY c.id DESC ",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );


  exports.findtbl_sheftByshf_id = async (wh_id,lc_id,shf_id) =>
  await db.sequelize.query(
    `SELECT shf.id FROM tbl_sheft shf
        inner join tbl_location lc 
        on shf.lc_id = lc.id
        inner join tbl_warehouse wh
        on shf.wh_id = wh.id
        where shf.shf_id='${shf_id}' and wh.wh_id='${wh_id}' and lc.lc_id='${lc_id}'`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
