const db = require("../db/models");

/// ------ reset pass,send email, old api ------

exports.findAll = async () =>
  await db.sequelize.query(
    `SELECT A.id , A.emp_id , A.user_role , A.username , A.password , A.authorize_id , A.approver_level1 , A.approver_level2 , A.approver_level3 , 
   A.division_id,A.section_id,A.level, A.imagesignature, A.image ,
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
                            FROM tbl_users A
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

exports.getByuserrole = async (role, user_id) =>
  await db.sequelize.query(
    `SELECT A.id , A.emp_id as emp_id , A.user_role , A.username , A.password , 
                            A.email , A.email_verified ,A.prename_en as prename_en , A.prename_th as prename_th, 
                            A.firstname,A.lastname,A.firstname_en as firstname_en,A.lastname_en as lastname_en,A.emp_rate,A.abbname_en as abbname_en,
                            A.emp_status,CASE
                                WHEN A.emp_status = 'A' THEN 'Active'
                                ELSE 'Inactive'
                            END as emp_status_name,
                            A.image , A.user_create , A.created_at , A.user_update , A.updated_at , A.role
                            FROM tbl_users A WHERE A.user_role="${role}" AND A.id != ${user_id} AND A.email != ""`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.updatetbl_usersStatusN = async (id) => {
  // await db.tbl_users.update(
  //   { emp_status: "Y" },
  //   { where: { id: id } }
  // );
  var q_sta = `UPDATE tbl_users  set emp_status = 'Y' WHERE id = ${id}`;

  return await db.sequelize.query(q_sta);
};

exports.findUserByEmail = async (email) =>
  await db.sequelize.query(
    `SELECT id,email
    FROM tbl_users 
    WHERE email = :email`,
    {
      replacements: { email },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findMyProfile = async (id) => {
  const res_profile = await db.sequelize.query(
    `SELECT id,email,firstName,lastName,username,
        user_role as user_role,
        position_id as positionId,
        department_id as departmentId,
        company_id as companyId,
        created_at as createdAt,
        updated_at as updatedAt,
        isnull(image,'') as image,
        isnull(signature,'') as signature,
        isnull(imagesignature,'') as imagesignature,
        isnull(seal,'') as seal
        FROM tbl_users 
        WHERE tbl_users.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

  // console.log("res_profile", res_profile);

  var profile = {
    firstName: res_profile[0].firstName.toString(),
    lastName: res_profile[0].lastName.toString(),
    allow_report_view_department: [],
    user_role: res_profile[0].user_role.toString(),
    personal_leave_quota: 2400,
    sick_leave_quota: 2400,
    annual_leave_quota: 2400,
    other_leave_quota: 2400,
    username: res_profile[0].username.toString(),
    email: res_profile[0].email.toString(),
    id: res_profile[0].id.toString(),
    createdAt: res_profile[0].createdAt.toString(),
    updatedAt: res_profile[0].updatedAt.toString(),
    companyId: res_profile[0].companyId.toString(),
    departmentId: res_profile[0].departmentId.toString(),
    positionId: res_profile[0].positionId.toString(),
    image: res_profile[0].image.toString(),
    signature: res_profile[0].signature.toString(),
    imagesignature: res_profile[0].imagesignature.toString(),
    seal: res_profile[0].seal.toString(),
  };

  return profile;
};

exports.FindUserById = async (id) =>
  await db.sequelize.query(
    `SELECT A.*,A.emp_id as emp_id , A.user_role , A.username , A.password , 
          A.email , A.email_verified ,A.prename_en as prename_en , A.prename_th as prename_th, 
          A.firstname,A.lastname,A.firstname_en as firstname_en,A.lastname_en as lastname_en,A.emp_rate,A.abbname_en as abbname_en,
          A.emp_status,CASE
              WHEN A.emp_status = 'A' THEN 'Active'
              ELSE 'Inactive'
          END as emp_status_name,
          A.image , A.user_create , A.created_at , A.user_update , A.updated_at , A.role
          FROM tbl_users A
          WHERE A.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getFindbyId = async (id) =>
  await db.sequelize.query(
    `SELECT tbl_users.id,CONCAT(tbl_users.firstname,'  ',tbl_users.lastname) as name,position.name as position_name,department.name as department_name ,company.name_th as company_name
          FROM tbl_users,position,department,company
          WHERE tbl_users.position_id = position.id
          and tbl_users.department_id = department.id
          and tbl_users.company_id = company.id
          and  tbl_users.id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getaccountByCompany = async (id) =>
  await db.sequelize.query(
    `SELECT tbl_users.id,
        CONCAT(tbl_users.firstname,'  ',tbl_users.lastname) as name
        FROM tbl_users
        WHERE tbl_users.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAllList = async () =>
  await db.sequelize.query(
    `SELECT id, CONCAT(firstname,'  ',lastname) as name FROM tbl_users `,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAllListActive = async () =>
  await db.sequelize.query(
    `SELECT id, CONCAT(firstname,'  ',lastname) as name FROM tbl_users WHERE tbl_users.emp_status='A'`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findAuthorize = async (id, router_path) => {
  let q_index = [id, router_path];
  // console.log("findAuthorize q_index:", q_index);

  const res = await db.sequelize.query(
    `SELECT tbl_users.id,tbl_config_menu_detail.cmd_route,
        tbl_setting_menu_detail.smd_view, 
        tbl_setting_menu_detail.smd_add, 
        tbl_setting_menu_detail.smd_edit, 
        tbl_setting_menu_detail.smd_del  
        FROM tbl_users 
          left join tbl_setting_menu_detail on tbl_users.authorize_id = tbl_setting_menu_detail.setting_group_menu_id
          left join tbl_config_menu_detail on tbl_setting_menu_detail.menu_detail_id = tbl_config_menu_detail.id
        WHERE tbl_users.id = ? and tbl_config_menu_detail.cmd_route = ?`,
    {
      replacements: q_index,
      type: db.sequelize.QueryTypes.SELECT,
    }
  );
  // console.log("findAuthorize res:", JSON.stringify(res));
  return res;
};

/// ------ reset pass,send email, old api ------

exports.add = async (account) => await db.tbl_users.create(account);

exports.findById = async (id) => await db.tbl_users.findByPk(id);

exports.findByUsername = async (username) =>
  await db.tbl_users.findOne({
    where: {
      username,
    },
  });

exports.FindUserById = async (id) =>
  await db.tbl_users.findOne({
    where: {
      id,
    },
  });

exports.findByUsernamelogin = async (username) =>
  await db.tbl_users.findOne({
    where: {
      username,
    },
    include: [{ model: db.company }],
  });

exports.delete_by_id = async (id, data) =>
  await db.tbl_users.update(data, {
    where: {
      id: id,
    },
  });

exports.update = async (id, data) =>
  await db.tbl_users.update(data, {
    where: {
      id: id,
    },
  });

exports.updateReplace1 = async (approver_level1, data) =>
  await db.tbl_users.update(data, {
    where: {
      approver_level1: approver_level1,
    },
  });
exports.updateReplace2 = async (approver_level2, data) =>
  await db.tbl_users.update(data, {
    where: {
      approver_level2: approver_level2,
    },
  });
exports.updateReplace3 = async (approver_level3, data) =>
  await db.tbl_users.update(data, {
    where: {
      approver_level3: approver_level3,
    },
  });

exports.delete = async (id) =>
  await db.tbl_users.destroy({
    where: {
      id,
    },
  });

exports.findSystemId = async () =>
  await db.sequelize.query(
    "SELECT TOP 1 u.id FROM tbl_users u  ORDER BY u.id DESC ",
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.changeapprovallv1 = async (data) =>
  await db.tbl_users.update(
    { approver_level1: data.newapproval },
    {
      where: {
        approver_level1: data.oldapproval,
      },
    }
  );

exports.changeapprovallv2 = async (data) =>
  await db.tbl_users.update(
    { approver_level2: data.newapproval },
    {
      where: {
        approver_level2: data.oldapproval,
      },
    }
  );

exports.changeapprovallv3 = async (data) =>
  await db.tbl_users.update(
    { approver_level3: data.newapproval },
    {
      where: {
        approver_level3: data.oldapproval,
      },
    }
  );


  exports.findByemp_id = async (emp_id,company_id) =>
  await db.tbl_users.findOne({
    where: {
      emp_id:emp_id,
      company_id:company_id,
    },
  });
