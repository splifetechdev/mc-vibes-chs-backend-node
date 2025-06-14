const multer = require('multer')
const fs = require('fs');

exports.keyUpload = "file"

exports.config = {
    storage: multer.diskStorage({
        destination: (req, file, next) => {
            const ext = file.mimetype.split("/")[1];
            let foldername = "";
            if(file.mimetype === "application/pdf"){
                foldername = "memo_master_files"
            }else{
                foldername = "memo_master_images"
            }
            const folder = `./${foldername}/${req.params.memo_master_id}`;
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder)
            }
            next(null, folder)
        },
        filename: function (req, file, next) {
            let filname = file.originalname;
            // const ext = file.mimetype.split("/")[1];
        
            // let filname = "";
            // if(file.mimetype === "application/pdf"){
            //     filname = "pdf"
            //   }else{
            //     filname = "image"
            //   }
              next(null, `${filname}`)
            // next(null, `${filname}-${Date.now()}.${ext}`)
        }
    }),
    limits: {
        fieldSize: 1024 * 1024 * 5,
    },
    fileFilter(req, file, next) {
        const image = file.mimetype.startsWith("image/");
        const pdf = file.mimetype.startsWith("application/pdf");
    
    if (image || pdf) {
            next(null, true)
        } else[
            next({ message: "File type not supported" }, false)
        ]
    },
}