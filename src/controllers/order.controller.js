const OrderService = require("../services/order.service");

exports.getAll = async (req, res) =>
  res.json(await OrderService.findAll(req.params.id));

exports.getAllByOrdId = async (req, res) =>
  res.json(await OrderService.findAllByOrdId(req.params.id));

exports.getOrderByQuery = async (req, res) =>
  res.json(await OrderService.getOrderByQuery(req.params.id, req.body));

exports.findIdByDocRunning = async (req, res) =>
  res.json(await OrderService.findIdByDocRunning(req.params.doc_running , req.params.id));

exports.findAdjustPlanDraftByDocRunning = async (req, res) =>
  res.json(
    await OrderService.findAdjustPlanDraftByDocRunning(req.params.doc_running)
  );

exports.getAllByID = async (req, res) =>
  res.json(
    await OrderService.findAllByID(req.params.id, req.params.u_define_id)
  );

exports.create = async (req, res) =>
  res.json(await OrderService.create(req.body));

exports.update = async (req, res) => {
  try {
    res.status(201).json(await OrderService.update(req.params.id, req.body));
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    res.status(200).json(await OrderService.delete(req.params.id));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.InsertdataFromEcons = async (req, res) => {
  let checkdata_success=0;
  let checkdata_fail=0;
  try {
     const result = await OrderService.V_ORD_From_Econs();
        if(result.length > 0){
            result.forEach(async(x,i)=>{
              try {
              await OrderService.create({
                doc_module_name: x.module,
          doc_running_no: x.REFMFG,
          item_master_id: x.itemid,
          order_qty: x.QTYORD,
          rtg_id: x.rtgid,
          line_of_mch: '1',
          order_date: x.ORDDATE,
          due_date: x.DUEDATE,
          due_time:'01:00:00.0000000',
          status: 'D',
          company_id: 1,
          qty_receive: x.QTYRCD,
          qty_remain: x.remain,
          qty_kg: 0,
          user_create: 0,
          user_update: 0,
              });
              checkdata_success++;
            }catch (error) {
              checkdata_fail++;
              console.error(error);
            }
            if(i === result.length - 1) {
              res.status(200).json({
                total:result.length,
                success:checkdata_success,
                fail:checkdata_fail,
                message: `Insert data from Econs completed. Success: ${checkdata_success}, Fail: ${checkdata_fail}`,
              });

            }
          });
        }else{
           res.status(200).json({
                total:result.length,
                success:checkdata_success,
                fail:checkdata_fail,
                message: `Insert data from Econs completed. Success: ${checkdata_success}, Fail: ${checkdata_fail}`,
              });
        }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

