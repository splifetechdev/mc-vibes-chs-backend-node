const mailService = require("./mail.service");
const accountService = require("./account.service");
const bank_masterService = require("../services/bank_master.service");

var xl = require("excel4node");

exports.createbankExcel = async (Year, Month) => {
  try {

    var databank_master = await bank_masterService.getreportlastdayofmonth();
    // console.log(Year)
    // console.log(Month)
    // return;

 
      if (databank_master.length > 0) {
        await createExcelFormData(
            databank_master,
            Year,
            Month
        );
      }
    
 
  } catch (error) {
    console.log(error);
  }
};

async function createExcelFormData(
  dataArray,Year,Month
) {
  // console.log("createExcel dataArray : " + JSON.stringify(dataArray));

  // Create a new instance of a Workbook class
  var wb = new xl.Workbook();

  var currentDate = new Date();
  var str_date = formatDate(currentDate);

  // Add Worksheets to the workbook
  var ws = wb.addWorksheet("bank");
  var row_start = 4;

  // Create a reusable style
  var style = wb.createStyle({
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#37e0ff",
    },
    numberFormat: "$#,##0.00; ($#,##0.00); -",
  });

  ws.cell(1, 1).string(
    `นำส่งรายงานยอดเงินคงเหลือประจำเดือน ${formatMonthNumberToString(Month)} ปี ${Year}`
  );

  ws.cell(3, 1).string("bank_for").style(style);
  ws.cell(3, 2).string("book_bank_name").style(style);
  ws.cell(3, 3).string("bank_name").style(style);
  ws.cell(3, 4).string("bank_branch").style(style);
  ws.cell(3, 5).string("balance").style(style);
  ws.cell(3, 6).string("type").style(style);
  ws.cell(3, 7).string("sub_type").style(style);
  ws.cell(3, 8).string("bank_no").style(style);
  ws.cell(3, 9).string("interest").style(style);
  ws.cell(3, 10).string("due_date").style(style);
  ws.cell(3, 11).string("remark").style(style);



  for await (const x of dataArray) {
    ws.cell(row_start, 1).string(x.bank_for ? x.bank_for : "");
    ws.cell(row_start, 2).string(x.book_bank_name ? x.book_bank_name : "");
    ws.cell(row_start, 3).string(x.bank_name ? x.bank_name : "");
    ws.cell(row_start, 4).string(x.bank_branch ? x.bank_branch : "");
    ws.cell(row_start, 5).number(x.balance ? Number(parseFloat(Buffer.from(`${x.balance}`, "base64").toString("utf8")).toFixed(2)): "");
    ws.cell(row_start, 6).string(x.bank_type ? x.bank_type : "");
    ws.cell(row_start, 7).string(x.sub_type ? x.sub_type : "");
    ws.cell(row_start, 8).string(x.bank_no ? x.bank_no : "");
    ws.cell(row_start, 9).string(x.interest ? String(x.interest) : "");
    ws.cell(row_start, 10).string(x.due_date ? x.due_date : "");
    ws.cell(row_start, 11).string(x.remark ? x.remark : "");
    row_start++;
  }

  var filename = `bank_report_${Month}_${Year}.xlsx`;
  var filepath = `./bank_schedule_file/bank_report_${Month}_${Year}.xlsx`;
  wb.write(filepath);

  let sendemail_to = "";
  sendemail_to = ["guppiya80130@hotmail.com"];
    // sendemail_to = ["guppiya80130@hotmail.com","csxman69@gmail.com","phatsaporn@gmail.com","phatsaporn@snapa.co.th"];
  // sendemail_to = ["katevalee@snapa.co.th","suthiphan@snapa.co.th","tuangporn@snapa.co.th","arporn@snapa.co.th"];
  // sendemail_to = ["tuangporn@snapa.co.th"];
  await mailService.sendMailScheduleJobBankAutoReport(
    sendemail_to,
    filename,
    filepath,
    Year,
    Month,
    dataArray
  );
}



function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

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
