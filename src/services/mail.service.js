var nodemailer = require("nodemailer");
const fs = require("fs");

const emailHost = "mail.splifetech.com";
const emailPort = 465;
const emailFrom = "bank_ceo@splifetech.com";
const userPassword = "banksnt";

// const emailHost = "thsv67.hostatom.com";
// const emailPort = 465;
// const emailFrom = "spmemo@splifetech.com";
// const userPassword = "mymemo2022";


const transporter = nodemailer.createTransport({
  secure: true, // true for 465, false for other ports
  host: emailHost,
  port: emailPort,
  auth: {
    user: emailFrom, // process.env.NODE_MAILER_USER ,
    pass: userPassword, //process.env.NODE_MAILER_PASSWORD
  },tls: {
    rejectUnauthorized: false
  }
});

exports.sendRequestApproveAdvance = async (payload) => {
  const options = {
    from: emailFrom,
    to: [payload.email],
    subject: "Request Approve Advance",
    text: `
  Name: ${payload.name} \n
  Email: ${payload.email} \n  
  Subject: Request Approve Advance \n
  Message: Request Approve Advance No.${payload.advance_id}  \n
  Click link below to approve advance \n ${payload.link}`,
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

exports.sendResetPassword = async (payload) => {
  const options = {
    from: emailFrom,
    to: [payload.email],
    subject: "Reset Password for SP-Memo",
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

exports.onUserRequest = async (payload) => {
  const options = {
    from: emailFrom,
    to: emailFrom,
    subject: "User Request for Dmeets",
    text: `
  Name: ${payload.name} \n
  Email: ${payload.email} \n
  Phone: ${payload.phone} \n
  Subject: ${payload.subject} \n
  Message: ${payload.message} \n
  `,
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
exports.onNotifyUsersLicense = async (account) => {
  const options = {
    from: emailFrom,
    to: account.username,
    subject: `Dmeets Notification ${
      account.acc_plan === "FREE" ? "Free" : "License"
    }`,
    text: `Thank you for using Dmeets service ${
      account.acc_plan === "FREE" ? "" : "at Law"
    }
      \n The following account will expire soon.
      \n [Expiration date]
      \n ${account.acc_plan_expire}
      \n [Account Name]
      \n ${account.acc_fullname}
      \n The above account has not renewed the Dmeets@Law service
      \n Please contact our staff member and renew it today at email: admin@dcm.co.th
      \n\nBest regards,
      \nAdmin DCM`,
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
exports.onSendOTP = async (payload) => {
  payload.ver_expire = payload.ver_expire.replace("Indochina", "Bangkok");
  const options = {
    from: emailFrom,
    to: [payload.ver_email],
    subject: "Verify Identity for Dmeets (Identity Verification System)",
    text: `
        Meeting ID: ${payload.meet_id} \n
        Email: ${payload.ver_email} \n
        OTP: ${payload.ver_otp} \n
        Date Expire: ${payload.ver_expire} \n
        Subject: Verify Identify \n
        Message: Verify Identify From OTP \n
        `,
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

exports.inviteMembers = async (payload) => {
  const options = {
    from: emailFrom,
    to: payload.members,
    subject: "Invitiation Link For Dmeets",
    text: payload.link,
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

function formatMonthNumberToString(month) {
  let months_th = [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม", ];
  let months_th_mini = [ "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.", ];

  return months_th[month-1];
}

function formatYearenToth(yearen) {
  let yearth = 0;
  yearth = parseInt(yearen+543)

  return yearth;
}

