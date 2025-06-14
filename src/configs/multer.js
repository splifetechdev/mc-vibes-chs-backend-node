const multer = require('multer')
const fs = require('fs');

exports.keyUpload = "image"

exports.config = {
    storage: multer.diskStorage({
        destination: (req, file, next) => {
            const ext = file.mimetype.split("/")[1];
            let foldername = "images";
            const folder = `./${foldername}/${req.params.file_number}`;
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder)
            }
            next(null, folder)
        },
        filename: function (req, file, next) {
            console.log(file)
            let filname = file.originalname;
            filname = filname.replace(/\s/g, '_');
              next(null, `${filname}`)
        }
    }),
    limits: {
        fieldSize: 1024 * 1024 * 5,
    },
    fileFilter(req, file, next) {
        const image = file.mimetype.startsWith("image/");
        const pdf = file.mimetype.startsWith("application/pdf");
    
    if (image) {
            next(null, true)
        } else[
            next({ message: "File type not supported" }, false)
        ]
    },
}