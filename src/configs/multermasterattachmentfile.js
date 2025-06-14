const multer = require('multer')
const fs = require('fs');

exports.keyUpload = "file"

exports.config = {
    storage: multer.diskStorage({
        destination: (req, file, next) => {
            const ext = file.mimetype.split("/")[1];
            let foldername = "memo_master_files";
          
            
            const folder = `./${foldername}/${req.params.memo_id}`;
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
        const pdf = file.mimetype.startsWith("application/pdf");
        const xlsx = file.mimetype.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        const docx = file.mimetype.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        
    
    if (pdf || xlsx || docx) {
            next(null, true)
        } else[
            next({ message: "File type not supported" }, false)
        ]
    },
}