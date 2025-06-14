const reportallService = require("../services/reportall.service");

exports.getAll = async (req, res) => res.json(await reportallService.findAll());

exports.getAll_By_CompanyID = async (req, res) =>
  res.json(await reportallService.findAll_By_CompanyID(req.params.id));

exports.create = async (req, res) =>
  res.json(await reportallService.create(req.body));

exports.update = async (req, res) =>
  res.json(await reportallService.update(req.params.id, req.body));

exports.delete = async (req, res) =>
  res.json(await reportallService.delete(req.params.id));

exports.cloth_registration_mch = async (req, res) =>{
  let sql=`SELECT  distinct tbl_opn_ord.machine_id,tbl_mch.machine_id,doc_running_no
      FROM tbl_opn_ord left join tbl_mch on tbl_opn_ord.machine_id = tbl_mch.id
      `;
  if(req.body.doc_running_no && req.body.doc_running_no != ""){
      sql+=` where doc_running_no LIKE '%${req.body.doc_running_no}%'`
  }
  res.json(await reportallService.cloth_registration_mch(sql));
}
  

exports.cloth_registration_sum = async (req, res) =>{
  let sql=`SELECT * from V_rpt_receive_inv_sum where doc_running_no = '${req.body.doc_running_no}'`;
if(req.body.status && req.body.status != ""){
  sql+=` and status = '${req.body.status}'`
}
  res.json(await reportallService.cloth_registration_sum(sql));
}
  
exports.cloth_registration_detail = async (req, res) =>{
  let sql=`SELECT * from V_rpt_receive_inv_detail where doc_running_no = '${req.body.doc_running_no}'`;
if(req.body.status && req.body.status != ""){
  sql+=` and status = '${req.body.status}'`
}
  sql+=` order by date_receive ASC`
  res.json(await reportallService.cloth_registration_detail(sql));
}
