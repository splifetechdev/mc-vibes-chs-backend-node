const db = require("../db/models");
// const dbquery = require("../db/db");
exports.add = async (data) => await db.tbl_worker.create(data);

exports.update = async (id, data) =>
  await db.tbl_worker.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_worker.destroy({
    where: {
      id: id,
    },
  });

exports.findByCompany = async (company_id) =>
  await db.tbl_worker.findAll({
    where: {
      company_id: company_id,
    },
  });

exports.findAll = async () =>
  await db.sequelize.query(
    `SELECT A.id , A.emp_id , A.user_role ,A.authorize_id , A.approver_level1 , A.approver_level2 , A.approver_level3 , 
   A.division_id,A.section_id,A.level, A.image ,
                            A.email , A.email_verified ,A.prename_en , A.prename_th , 
                            A.firstname , A.lastname , A.firstname_en , A.lastname_en , A.emp_rate , A.abbname_en,
                            A.emp_status,CASE
                                WHEN A.emp_status = 'A' THEN 'Active'
                                ELSE 'Inactive'
                            END as emp_status_name,
                            A.image , A.user_create , A.created_at , A.user_update , A.updated_at , A.role ,
                            B.id as company_id,B.name_th as company_name  , 
                            C.id as department_id , C.name as department_name , 
                            D.id as position_id ,D.name as position_name ,
                            DVS.name as division_name,
                            ST.name as section_name
                            FROM tbl_worker A
                            LEFT JOIN company B 
                            ON  A.company_id = B.id
                            LEFT JOIN department C
                            ON A.department_id = C.id 
                            LEFT JOIN position D
                            ON A.position_id = D.id
                            LEFT JOIN division DVS
                            ON A.division_id = DVS.id
                            LEFT JOIN section ST
                            ON A.section_id = ST.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.FindUserById = async (id) =>
  await db.tbl_worker.findOne({
    where: {
      id: id,
    },
  });

exports.changeapprovallv1 = async (data) =>
  await db.tbl_worker.update(
    { approver_level1: data.newapproval },
    {
      where: {
        approver_level1: data.oldapproval,
      },
    }
  );

exports.changeapprovallv2 = async (data) =>
  await db.tbl_worker.update(
    { approver_level2: data.newapproval },
    {
      where: {
        approver_level2: data.oldapproval,
      },
    }
  );

exports.changeapprovallv3 = async (data) =>
  await db.tbl_worker.update(
    { approver_level3: data.newapproval },
    {
      where: {
        approver_level3: data.oldapproval,
      },
    }
  );

  exports.findByemp_id = async (emp_id,company_id) =>
  await db.tbl_worker.findOne({
    where: {
      emp_id:emp_id,
      company_id:company_id,
    },
  });