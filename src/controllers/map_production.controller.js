const map_productionService = require("../services/map_production.service");
const jobService = require("../services/job.service");

exports.getAll = async (req, res) =>{
  res.json(await map_productionService.findAll({id:result.plc_id,datefrom:req.body.datefrom,dateto:req.body.dateto}));

}
  
exports.findmap_productionAllProductivity = async (req, res) =>{
  let dataAll = [];
  const result = req.body;
  res.json(await map_productionService.findmap_productionAllProductivity({mch_id:result.mch_id,start_at:result.start_at,end_at:result.end_at}));
  // if(result.length > 0){
  //     for(i=0;i<result.length;i++){
  //    const dataprod =  await map_productionService.findmap_productionAllProductivity({mch_id:result.mch_id,start_at:result.start_at,end_at:result.end_at});
  //    if(dataprod){
  //     for(j=0;j<dataprod.length;j++){
  //       dataAll.push(dataprod[j])
  //       if(i == result.length-1 && j == dataprod.length-1){
  //         res.json(dataAll);
  //        }
  //     }
  //    }else{
  //     if(i == result.length-1){
  //       res.json(dataAll);
  //      }
  //    }
  //   }
  // }else{
  //  res.json(dataAll);
  // }
 }

  exports.findmap_productionAllDownTime = async (req, res) =>{
    let dataAll = [];
    const result = req.body;
    if(result.length > 0){
        for(i=0;i<result.length;i++){
       const dataprod =  await map_productionService.findmap_productionAllDownTime({mch_id:result[i].mch_id,start_at:result[i].start_at,end_at:result[i].end_at});
       if(dataprod){
        for(j=0;j<dataprod.length;j++){
          dataAll.push(dataprod[j])
          if(i == result.length-1 && j == dataprod.length-1){
            res.json(dataAll);
           }
        }
       }else{
        if(i == result.length-1){
          res.json(dataAll);
         }
       }
      }
    }else{
     res.json(dataAll);
    }
   }

exports.getAllByID = async (req, res) =>
  res.json(await map_productionService.findAllByID(req.params.id,req.params.u_define_id));


exports.create = async (req, res) =>
  res.json(await map_productionService.create(req.body));

exports.update = async (req, res) => {
  try {
    const dataAll = req.body;
    await Promise.all(dataAll.map(async (x) => {
      await map_productionService.update(x.IOTID, x);
    }));
    res.status(201).json({message: "Successfully updated!"});
  } catch (error) {
    console.log("error update iot map production");
    console.log(error);
    res.json({ message: error.message });
    return;
  }
};

exports.delete = async (req, res) => {
  res.json(await map_productionService.delete(req.params.id));
};


function formatDate(date) {
  if (!date) return null;

  const [year, month, day] = date.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}