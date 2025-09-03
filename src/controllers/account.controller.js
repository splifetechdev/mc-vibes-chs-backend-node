const accountService = require("../services/account.service");
const multer = require("multer");
const multerConfig = require("../configs/multer");
const upload = multer(multerConfig.config).single(multerConfig.keyUpload);
const mailService = require("../services/mail.service");
const VersionService = require("../services/version.service");
const departmentService = require("../services/department.service");
const positionService = require("../services/position.service");
const divisionService = require("../services/division.service");
const sectionService = require("../services/section.service");

// const imagesService = require("../services/fileservice.service");

/// ------ reset pass,send email, old api ------
exports.sendMailResetPassword = async (req, res) => {
  try {
    const link = `${process.env.NODE_ENV === "production"
      ? "https://sp-memo-frontend-dev.netlify.app/"
      : "http://localhost:8080/"
      }forgot-reset-password/${req.body.id}`;
    //http://localhost:8080/edit-advance/25/approve
    req.body.link = link;

    const emailResponse = await mailService.sendResetPassword(req.body);

    if (!emailResponse || !emailResponse.sent) {
      return res.status(200).send(emailResponse);
    }
    return res.status(200).send({
      link: true,
      message: "Request Reset Password sent to your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

exports.getUserByEmail = async (req, res) =>
  res.json(await accountService.findUserByEmail(req.params.email));

exports.resetPassword = async (req, res) =>
  res.json(await accountService.resetPassword(req.params.id, req.body));

/// ------ reset pass,send email, old api ------

exports.addUserAccount = async (req, res) => {
  let findsystem_id = await accountService.findSystemId()
  if (!findsystem_id[0] || !findsystem_id[0].id) {
    req.params.file_number = 1;
  } else {
    req.params.file_number = parseInt(findsystem_id[0].id + 1);
  }
  upload(req, res, async (error) => {
    if (error) {
      console.log(`error: ${JSON.stringify(error)}`);
      return res.status(500).json({ message: error.message });
    }

    if(req.body.emp_rate == "" || !req.body.emp_rate || req.body.emp_rate == null || req.body.emp_rate == "null"){
      req.body.emp_rate = null;
    }

    req.body.id = req.params.file_number;

    res.status(200).json(await accountService.add(req.body));

  });
};

exports.updateUserAccount = async (req, res) => {
  try {
    req.params.file_number = req.params.id;
    upload(req, res, async (error) => {
      if (error) {
        console.log(`error: ${JSON.stringify(error)}`);
        return res.status(500).json({ message: error.message });
      }
      if(req.body.emp_rate == "" || !req.body.emp_rate || req.body.emp_rate == null || req.body.emp_rate == "null"){
        req.body.emp_rate = null;
      }
      
      res.json(await accountService.update(req.params.id, req.body));

    });
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};


exports.deleteUserAccount = async (req, res) =>
  res.json(await accountService.delete_user_account(req.params.id, req.body));

exports.replaceUserAccount1 = async (req, res) =>
  res.json(await accountService.update_rep1(req.params.id, req.body));

exports.replaceUserAccount2 = async (req, res) =>
  res.json(await accountService.update_rep2(req.params.id, req.body));

exports.replaceUserAccount3 = async (req, res) =>
  res.json(await accountService.update_rep3(req.params.id, req.body));

/**
 * @swagger
 * /account/register:
 *   post:
 *     summary: Create new account
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: The account was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 */
exports.register = async (req, res) =>
  res.status(201).json(await accountService.register(req.body));

/**
 * @swagger
 * /account/login:
 *   post:
 *     summary: Login and response jwt token
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Un Authenticated
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await accountService.login(username, password);
    if (!token) {
      res.status(401).json();
      return;
    } else if (token == "expire_date") {
      res.status(406).json();
      return;
    }

    const result = await accountService.checkregister(username);
    console.log(JSON.stringify(result));
    const acc_fullname =
      jsonParser(result, "prename_th") +
      " " +
      jsonParser(result, "firstname") +
      " " +
      jsonParser(result, "lastname");
    const image = jsonParser(result, "image");
    const role = jsonParser(result, "user_role");
    const company_id = jsonParser(result, "company_id");
    const department_id = jsonParser(result, "department_id");
    const position_id = jsonParser(result, "position_id");
    const authorize_id = jsonParser(result, "authorize_id");
    const user_id = jsonParser(result, "id");
    const user_id_str = user_id.toString();
    const email = jsonParser(result, "email");
    const approver_level1 = jsonParser(result, "approver_level1");

    const result2 = await accountService.findId(approver_level1);
    // console.log("result2:", JSON.stringify(result2));
    let approver_level1_email = "";
    if (result2) {
      approver_level1_email = result2.email;
    }

    // const result2 = await companyService.findById(company_id);
    // const company_name = jsonParser(result2, "company_name");
    // const result3 = await departmentService.findById(department_id);
    // const department_name = jsonParser(result3, "department");
    // const acc_plan = jsonParser(result, "acc_plan");
    const created_at = jsonParser(result, "created_at");

    // var payload = {
    //   user_id,
    //   user_id_str,
    //   username,
    //   acc_fullname,
    //   role,
    //   created_at,
    //   company_id,
    //   department_id,
    //   position_id,
    //   authorize_id,
    //   email,
    //   approver_level1,
    //   approver_level1_email,
    //   token,
    // };

    const result_version = await VersionService.findAll();
    // console.log("result_version:", JSON.stringify(result_version));
    var v_web = result_version[0].v_web;

    var payload = {
      user_id,
      user_id_str,
      username,
      acc_fullname,
      role,
      created_at,
      company_id,
      department_id,
      position_id,
      authorize_id,
      email,
      approver_level1,
      approver_level1_email,
      token,
      v_web
    };

    if (image != null || image != undefined || image != "") {
      payload.image = image;
    }

    res.json(payload);
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: error.message })
  }

};

function jsonParser(stringValue, field) {
  var string = JSON.stringify(stringValue);
  var objectValue = JSON.parse(string);
  return objectValue[field];
}

exports.checkregister = async (req, res) => {
  const { username } = req.query;
  console.log(username);
  res.json(await accountService.checkregister(username));
};

/**
 * @swagger
 * /account/info:
 *   get:
 *     summary: Returns info JWT
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: The info JWT
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/InfoResponse'
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.info = (req, res) => res.json({ username: req.sub, role: req.role });

exports.getTest = async (req, res) => res.json(await accountService.findAll());

exports.getAll = async (req, res) => res.json(await accountService.findAll());

exports.getByuserrole = async (req, res) => {
  res.json(
    await accountService.getByuserrole(req.query.role, req.query.user_id)
  );
};

exports.getAllList = async (req, res) =>
  res.json(await accountService.findAllList());

exports.getAllListActive = async (req, res) =>
  res.json(await accountService.findAllListActive());

exports.update = async (req, res) =>
  res.json(await accountService.update(req.params.id, req.body));
exports.delete = async (req, res) =>
  res.json(await accountService.delete(req.params.id));

exports.updateTest = async (req, res) =>
  res.json(await accountService.updateData());

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Account management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *        type: object
 *        required:
 *           - username
 *           - password
 *           - role
 *        properties:
 *            username:
 *              type: string
 *              description: The account username
 *            password:
 *              type: string
 *              description: The account password
 *            role:
 *              type: string
 *              description: The account role
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the account
 *         username:
 *           type: string
 *           description: The account username
 *         password:
 *           type: string
 *           description: The account password
 *         role:
 *           type: string
 *           description: The account role
 *         created_at:
 *           type: string
 *           description: The product created
 *         updated_at:
 *           type: string
 *           description: The product updated
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The account username
 *         password:
 *           type: string
 *           description: The account password
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The JWT token
 *     InfoResponse:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The account username
 *         role:
 *           type: string
 *           description: The account role
 *       example:
 *         username: iBlurBlur
 *         role: Admin
 */

/**
 * @swagger
 * /account/{id}:
 *   get:
 *     summary: Get the account by id
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The account id
 *     responses:
 *       200:
 *         description: The account description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountResponse'
 *       404:
 *         description: The account was not found
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.getFindId = async (req, res) =>
  res.json(await accountService.findId(req.params.id));

exports.getFindbyId = async (req, res) =>
  res.json(await accountService.getFindbyId(req.params.id));

exports.getaccountByCompany = async (req, res) =>
  res.json(await accountService.getaccountByCompany(req.params.id));

exports.getMyProfile = async (req, res) =>
  res.json(await accountService.findMyProfile(req.params.id));

exports.getAuthorize = async (req, res) =>
  res.json(
    await accountService.findAuthorize(req.params.id, req.params.router_path)
  );


exports.changeapprovaluser = async (req, res) => {
  // res.json(await accountService.changeapprovallv1(req.body));
  await accountService.changeapprovallv1(req.body);
  await accountService.changeapprovallv2(req.body);
  res.json(await accountService.changeapprovallv3(req.body));
}

exports.import_employee = async (req, res) => {
  let dataAllinsertlength = [];
  let dataAllfaillength = [];
  let newData = [];
  if(req.body.length > 0){
    newData = req.body.slice(2);
    // return res.json({ message: "No data" });
    newData.forEach(async(item,index) => {
      const checkemp_id =  await accountService.findByemp_id(String(item[0]),req.requester_company_id);
      const getdapartment_id =  await departmentService.findBycode(String(item[10]),req.requester_company_id);
      const getposition_id =  await positionService.findByname(String(item[11]),req.requester_company_id);
      const getdivision_id =  await divisionService.findBycode(String(item[12]),req.requester_company_id);
      const getsection_id =  await sectionService.findBycode(String(item[13]),req.requester_company_id);
      
      // const checkemp_id =  await accountService.findByemp_id(String(item.emp_id));
      // || !getdivision_id?.id || !getsection_id?.id
     if(checkemp_id?.emp_id || !getdapartment_id?.id || !getposition_id?.id){
      // console.log("ไม่มีข้อมูล");
      dataAllfaillength.push(item);
     }else{
      let data = {
        emp_id: item[0],
        username: item[1],
        email: item[2]?item[2]:"",
        prename_th: item[3],
        firstname: item[4],
        lastname: item[5],
        prename_en: item[6],
        firstname_en: item[7],
        lastname_en: item[8],
        abbname_en: item[9],
        department_id: getdapartment_id?.id,
        position_id: getposition_id?.id,
        division_id: getdivision_id?.id ?? null,
        section_id: getsection_id?.id ?? null,
        level: item[14],
        entry_date: item[15],
        password:item[1],
        user_role:"EMPLOYEE",
        email_verified:0,
        company_id: req.requester_company_id,
        authorize_id: 2,
        emp_rate: 0,
        emp_status:"A",
        image:"",
        user_create:req.requester_id,
        user_update:req.requester_id,
      };
      // console.log("data:", data);
      try {
        dataAllinsertlength.push(data);
        await accountService.add(data);
      } catch (error) {
          console.log(error)
        dataAllfaillength.push(data);
      }
     }
     if(index == newData.length - 1){
      res.json({ message: "Import data successfully", total:newData.length, insert:dataAllinsertlength.length, fail:newData.length-dataAllinsertlength.length });
      return;

     }
    });
  }else{
    res.json({ message: "No data" });
    return;
  }
 
}
