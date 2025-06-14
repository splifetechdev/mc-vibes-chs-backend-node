const costingService = require("../services/costing.service");
const db = require("../db/models");
const costingRepository = require("../repositories/costing.repository");
const cost_foh_per_opnRepository = require("../repositories/cost_foh_per_opn.repository");
const cost_labor_per_opnRepository = require("../repositories/cost_labor_per_opn.repository");
const cost_per_timecardRepository = require("../repositories/cost_per_timecard.repository");

exports.searchByV_ORD_costing = async (req, res) => {
  // console.log(req.body);
  sql = `select * from V_ORD_costing`;
  if(req.body.doc_running_no !=='' || req.body.item_id !=='' || req.body.item_name !=='' || req.body.status !=='' || req.body.date1 !=='' || req.body.date2 !==''){
    sql += ` where`;
    if(req.body.doc_running_no !==''){
      sql += ` doc_running_no LIKE '%${req.body.doc_running_no}%'`;
    }
    if(req.body.item_id !==''){
      if(req.body.doc_running_no !==''){
        sql += ` and`;
      }
      sql += ` item_id LIKE '%${req.body.item_id}%'`;
    }
    if(req.body.item_name !==''){
      if(req.body.doc_running_no !=='' || req.body.item_id !==''){
        sql += ` and`;
      }
      sql += ` item_name LIKE '%${req.body.item_name}%'`;
    }
    if(req.body.status !==''){
      if(req.body.doc_running_no !=='' || req.body.item_id !=='' || req.body.item_name !==''){
        sql += ` and`;
      }
      sql += ` status ='${req.body.status}'`;
    }
    if(req.body.date1 !==''){
      if(req.body.doc_running_no !=='' || req.body.item_id !=='' || req.body.item_name !=='' || req.body.status !==''){
        sql += ` and`;
      }
      sql += ` closedate BETWEEN '${req.body.date1}' AND '${req.body.date2}'`;
    }
  }
  sql += ` ORDER BY doc_running_no DESC`;
  res.json(await costingService.searchByV_ORD_costing(sql));
};


exports.runcostbymanual = async (req, res) =>{
  // console.log(req.body.date1);
  await costingService.deletecost_foh_per_opnbydate(req.body.date1);
  await costingService.deletecost_labor_per_opnbydate(req.body.date1);
  await costingService.deletecost_per_timecardbydate(req.body.date1);

    await cost_foh_per_opnadd(req.body.date1);
    await cost_labor_peradd(req.body.date1);
    await cost_per_timecardadd(req.body.date1);
    await cost_per_timecardupdate(req.body.date1);
  
    return res.status(200).send({data:"success"});


}
async function cost_foh_per_opnadd (datadate){
  const result = await costingRepository.findALldataV_FOH_per_opn({date:datadate});

  if(result.length > 0){
         for(i=0;i<result.length;i++){
            try {
            await cost_foh_per_opnRepository.create({
              tcdate: result[i].tcdate,
              mch_id: result[i].machine_id,
              wc_id: result[i].work_center_id,
              opn_count: result[i].opn_count,
              foh_per_opn: result[i].foh_rate_per_opn,
              voh_per_opn: result[i].voh_rate_per_opn
            });
          }catch (error) {
            console.error(error);
          }
        }
        
      }
}
 
async function cost_labor_peradd (datadate){
  const result = await costingRepository.findALldataV_Labor_per_opn({date:datadate});
     if(result.length > 0){
  
      for(i=0;i<result.length;i++){
            try {
            await cost_labor_per_opnRepository.create({
              tc_date: result[i].tcdate,
              worker_id: result[i].worker_id,
              opn_count: result[i].opn_count,
              emp_rate: result[i].emp_rate,
              labor_per_opn: result[i].labor_rate_per_opn
            });
          }catch (error) {
            console.error(error);
          }
         }
        
      }
}
 
async function cost_per_timecardadd (datadate){
  const result = await costingRepository.findALldataV_FOH_cost_detail({date:datadate});

    if(result.length > 0){
        for(i=0;i<result.length;i++){
            try {
            await cost_per_timecardRepository.create({
              timecard_detail_id: result[i].tcdid,
              opn_ord_id: result[i].opn_ord_id,
              timecard_date: result[i].tcdate_start,
              act_foh: result[i].act_foh,
              act_voh: result[i].act_voh,
              act_labor:0,
            });
          }catch (error) {
            console.error(error);
          }
          }
        
      }
}

async function cost_per_timecardupdate (datadate){
  const result = await costingRepository.findALldataV_Labor_cost_detail({date:datadate});
   if(result.length > 0){

    for(i=0;i<result.length;i++){
            try {
            await cost_per_timecardRepository.updatemanywhere({
              timecard_detail_id: result[i].tcdid,
              opn_ord_id: result[i].opn_ord_id,
              timecard_date: result[i].tcdate_start,
              act_labor:result[i].act_labor,
            });
          }catch (error) {
            console.error(error);
          }
        }
        
      }
}
 

exports.SearchORDCostingDetailH = async (req, res) =>{
  res.json(await costingService.SearchORDCostingDetailH(req.body.doc_running_no));
}

exports.SearchORDCostingDetailD= async (req, res) =>{
  res.json(await costingService.SearchORDCostingDetailD(req.body.doc_running_no));
}