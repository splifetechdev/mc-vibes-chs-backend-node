const db = require('../db/models')
const { Op } = require('sequelize')

exports.findAll = async () => await db.tbl_ord_receive.findAll({
    order: [
        ['id', 'DESC']
    ]
})

exports.findById = async (id) => await db.tbl_ord_receive.findAll({
    where:{
        ord_id:id
    },
    attributes: {
        include: [
          [
            db.sequelize.fn(
              "FORMAT",
              db.sequelize.col("date_receive"),
              "dd/MM/yyyy"
            ),
            "date_receive_show",
          ],
          // [db.sequelize.fn('date_format',db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')), '%H.%i.%s'),'duration']
        ],
      },
      include: [
        { model: db.tbl_users ,
        attributes: {
            include: [
              [
                db.sequelize.fn(
                  "concat",
                  db.sequelize.col("firstname"),' ', 
                  db.sequelize.col("lastname"),
                ),
               "fullname"
              ],
              // [db.sequelize.fn('date_format',db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')), '%H.%i.%s'),'duration']
            ],
          },
        },
      ],
})

exports.create = async (data) => await db.tbl_ord_receive.create(data)

exports.update = async (id, data) => await db.tbl_ord_receive.update(data, {
    where: {
        id: id
    }
})

exports.delete = async (id) => await db.tbl_ord_receive.destroy({
    where: {
        id: id
    }
})

