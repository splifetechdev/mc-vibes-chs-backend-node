const db = require("../db/models");
const { Op } = require('sequelize');
// const dbquery = require("../db/db");

exports.findmap_productionAll = async (id) =>
await db.map_production.findAll({
  where: {
    machineid:id,
    // timeoff:0,
  },
});


exports.findmap_productionAllProductivity = async (data) =>
await db.map_production.findAll({
  where: {
    machine_id:data.mch_id,
    OEflag:0,
    // timeoff:0,
    [Op.or]: [
  {
    DataDateTime: {
      [Op.between]: [data.start_at, data.end_at]
    }
  }
  ],
  },
  // group: [
  //   ['fulldate'],
  // ],
  attributes: {
    include: [
      // [db.sequelize.literal('SUBSTRING(DataDateTime, 1,10)'), 'fulldate'],
      // [db.sequelize.literal('SUBSTRING(DataDateTime, -5,5)'), 'timehour']
      [db.sequelize.fn('FORMAT', db.sequelize.col('DataDateTime'), 'dd/MM/yyyy'), 'fulldate'],
      [db.sequelize.fn('FORMAT', db.sequelize.col('DataDateTime'), 'HH:mm'), 'timehour'],
      [db.sequelize.fn('FORMAT', db.sequelize.col('DataDateTime'), 'dd/MM/yyyy HH:mm'), 'datetimehour'],
      [db.sequelize.fn('FORMAT', db.sequelize.col('DataDateTime'), 'yyyy-MM-dd HH:mm'), 'datetimehournomal'],
    ],
  },
  include: [ 
    { model: db.tbl_job,
      required: false,
      where:{
        [Op.or]: [
          {
            start_at: {
          [Op.lte]:db.sequelize.col('DataDateTime') 
        },
        end_at: {
          [Op.gte]: db.sequelize.col('DataDateTime')
        }
      },
      ],
      },
      include: [  {
        model: db.tbl_opn_ord,
        required: true,
        where:{
          prod_status: {
            [Op.in]: ["S", "E"]
          }
        }
      },
    ],
    },
  ],
  order: [
    ['ID', 'ASC'],
],
});

exports.findmap_productionAllDownTime = async (data) =>
await db.map_production.findAll({
  where: {
    machine_id:data.mch_id,
    OEflag:0,
    TimeOFF: {
      [Op.gt]:0
    },
    [Op.or]: [
  {
    DataDateTime: {
      [Op.between]: [data.start_at, data.end_at]
    }
  }, 
  ],
  },
  attributes: {
    include: [
      // [db.sequelize.literal('SUBSTRING(DataDateTime, 1,10)'), 'fulldate'],
      // [db.sequelize.literal('SUBSTRING(DataDateTime, -5,5)'), 'timehour']
      [db.sequelize.fn('FORMAT', db.sequelize.col('DataDateTime'), 'dd/MM/yyyy hh:mm:ss'), 'fulldate'],
      [db.sequelize.fn('FORMAT', db.sequelize.col('DataDateTime'), 'hh:mm'), 'timehour']
    ],
  },
});


exports.create = async (data) => await db.map_production.create(data);

exports.update = async (id, data) =>
  await db.map_production.update({DTflag:data.DTflag,OEflag:data.OEflag}, {
    where: {
      IOTID: id,
    },
  });


exports.delete = async (id) =>
  await db.map_production.destroy({
    where: {
      id: id,
    },
  });
