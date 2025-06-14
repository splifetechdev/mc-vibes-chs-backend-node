const companyService = require("../services/company.service");
const multer = require("multer");
const multerConfig = require("../configs/multercompany");
const upload = multer(multerConfig.config).array(multerConfig.keyUpload);

exports.findById = async (req, res) =>
  res.json(await companyService.findById(req.params.id));

exports.getAll = async (req, res) =>
  res.json(await companyService.findAll(req.params.id));

exports.create = async (req, res) => {
  let findsystem_id = await companyService.findSystemId()
  if(!findsystem_id[0] || !findsystem_id[0].id){
    req.params.file_number = 1;
  }else{
    req.params.file_number = parseInt(findsystem_id[0].id + 1);
  }
  upload(req, res, async (error) => {
    if (error) {
      console.log(`error: ${JSON.stringify(error)}`);
      return res.status(500).json({ message: error.message });
    }
    // let filename = "";
    // if(req.files){
    //   req.files.forEach((x,index) =>{
    //     imagesService.create({ image: x.filename });
    //     filename += x.filename
    //     if(index < req.files.length-1){
    //       filename += ",";
    //     }
    //     }
    //   )
    // }
     // req.body.im_file =filename;
   
    req.body.id = req.params.file_number;
  
    res.status(200).json(await companyService.create(req.body));

  });
}
 

exports.update = async (req, res) => {
  try {
    req.params.file_number = req.params.id;
    upload(req, res, async (error) => {
      if (error) {
        console.log(`error: ${JSON.stringify(error)}`);
        return res.status(500).json({ message: error.message });
      }
      // let filename = "";
      // if(req.files){
  
      //   req.files.forEach((x,index) =>{
      //     imagesService.create({ image: x.filename });
      //     filename += x.filename
      //     if(index < req.files.length-1){
      //       filename += ",";
      //     }
      //     }
      //   )
      // }
      // req.body.im_file =filename;
      res.json(await companyService.update(req.params.id, req.body));
  
    });
  } catch (error) {
    res.json({ message: error.message });
    return;
  }
};
