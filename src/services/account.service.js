const accountRepository = require("../repositories/account.repository");
const versionService = require('../services/version.service')
// const account2Repository = require("../repositories/account2.repository");
// const companyRepository = require("../repositories/company.repository");

global.atob = require("atob");

const bcrypt = require("bcryptjs");
const jwt = require("../configs/jwt");

/// ------ reset pass,send email, old api ------

var nodemailer = require("nodemailer");

const emailHost = "smtppro.zoho.com";
const emailPort = 465;
const emailFrom = "admin@dcm.co.th";
const userPassword = "king$ize000";
// const userPassword = "kingsize000";

const transporter = nodemailer.createTransport({
  secure: true, // true for 465, false for other ports
  host: emailHost,
  port: emailPort,
  auth: {
    user: emailFrom, // process.env.NODE_MAILER_USER ,
    pass: userPassword, //process.env.NODE_MAILER_PASSWORD
  },
});

exports.sendResetPassword = async (payload) => {
  const options = {
    from: emailFrom,
    to: [payload.email],
    subject: "Reset Password for IP-AT-LAW",
    text: `Click link below to reset your password \n ${payload.link}`,
  };
  try {
    const request = await transporter.sendMail(options);
    if (request && request.response) {
      return { sent: true };
    } else {
      return { sent: false };
    }
  } catch (error) {
    console.log(error.message);
    return { sent: false, message: error.message };
  }
};

exports.resetPassword = async (id, account) => {
  account.password = await bcrypt.hash(account.password, 8);
  await accountRepository.update(id, account);
};

exports.findUserByEmail = async (email) =>
  await accountRepository.findUserByEmail(email);

/// ------ reset pass,send email, old api ------
exports.add = async (account) => {
  account.password = await bcrypt.hash(account.password, 8);
  await accountRepository.add(account);
};


exports.update = async (id, data) => await accountRepository.update(id, data);


exports.register = async (account) => {
  account.password = await bcrypt.hash(account.password, 8);
  return await accountRepository.add(account);
};

exports.login = async (username, password) => {
  const txt_encode = "@spkitztech";
  let expire_date;
  let datenow = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substr(0, 10);

  const result = await accountRepository.findByUsernamelogin(username);
  if (result.company.expire_date) {
    expire_date = parseDate(atob(result.company.expire_date).split(txt_encode)[0]);
    if (expire_date >= datenow) {
    } else {
      return "expire_date";
    }
  }

  // console.log("login result:", JSON.stringify(result));
  const version = await versionService.findOne()
  if (result && (await bcrypt.compare(password, result.password))) {
    const payload = {
      id: result.id,
      company_id: result.company_id,
      sub: result.username,
      role: result.user_role,
      v_web: version.v_web,
      addtional: "todo",
    };
    return jwt.generateToken(payload);
  }
  return "";
};

exports.update_acc = async (id, data) =>
  await accountRepository.update(id, data);

exports.update_rep1 = async (approver_level1, data) =>
  await accountRepository.updateReplace1(approver_level1, data);

exports.update_rep2 = async (approver_level2, data) =>
  await accountRepository.updateReplace2(approver_level2, data);

exports.update_rep3 = async (approver_level3, data) =>
  await accountRepository.updateReplace3(approver_level3, data);

exports.delete_acc = async (id) => await accountRepository.delete(id);

exports.delete_user_account = async (id, data) =>
  await accountRepository.delete_by_id(id, data);

exports.checkregister = async (username) =>
  await accountRepository.findByUsername(username);

exports.findAll = async () => await accountRepository.findAll();

exports.getByuserrole = async (role, user_id) => await accountRepository.getByuserrole(role, user_id);

exports.findAllList = async () => await accountRepository.findAllList();

exports.findAllListActive = async () => await accountRepository.findAllListActive();

exports.updateData = async () =>
  await accountRepository.testMysqlFindAllByIndex();

exports.findId = async (id) => await accountRepository.FindUserById(id);

exports.getFindbyId = async (id) => await accountRepository.getFindbyId(id);

exports.getaccountByCompany = async (id) =>
  await accountRepository.getaccountByCompany(id);

exports.findMyProfile = async (id) => await accountRepository.findMyProfile(id);

exports.findAuthorize = async (id, router_path) =>
  await accountRepository.findAuthorize(id, router_path);

exports.findSystemId = async () => await accountRepository.findSystemId();


exports.changeapprovallv1 = async (data) => {
  await accountRepository.changeapprovallv1(data);
}

exports.changeapprovallv2 = async (data) => {
  await accountRepository.changeapprovallv2(data);
}

exports.changeapprovallv3 = async (data) => {
  await accountRepository.changeapprovallv3(data);
}


function parseDate(date) {
  if (!date) return null;

  const [year, month, day] = date.split("/");
  return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
}

exports.findByemp_id = async (emp_id,company_id) => await accountRepository.findByemp_id(emp_id,company_id);
