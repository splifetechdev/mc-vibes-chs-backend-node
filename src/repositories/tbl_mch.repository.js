const db = require("../db/models");
const { Op } = require("sequelize");

exports.find_all = async (company_id) =>
  await db.tbl_mch.findAll({
    where: {
      company_id,
    },
     include: [{ model: db.company }, { model: db.tbl_work_center, include:[{ model: db.tbl_work_center_group }] }],
  });

exports.findAllMchToAdjustPOByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT id , concat(machine_id,' : ',name) as mch_name FROM tbl_mch where  company_id = ${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.find_mch_adjust_list = async (company_id) =>
  await db.sequelize.query(
    `SELECT id , concat(machine_id,' : ',name) as mch_name FROM tbl_mch where  company_id = ${company_id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.find_by_id = async (machine_id, u_define_module_id) =>
  await db.tbl_mch.findOne({
    where: {
      id: machine_id,
    },
    include: [
      {
        model: db.u_define_master,
        require: false,
        where: { u_define_module_id },
      },
    ],
  });

exports.find_machine_by_id = async (machine_id) =>
  await db.tbl_mch.findOne({
    where: {
      id: machine_id,
    },
    include: [db.tbl_work_center],
  });

exports.findByWorkcenterId = async (work_center_id) =>
  await db.tbl_mch.findAll({
    where: {
      work_center_id,
    },
    include: [{ model: db.company }, { model: db.tbl_work_center }],
  });

exports.find_by_id_getname = async (id) =>
  await db.tbl_mch.findOne({
    where: {
      id: id,
    },
  });

exports.find_by_company_id_and_machine_id = async (company_id, machine_id) =>
  await db.tbl_mch.findOne({
    where: {
      company_id,
      machine_id,
    },
  });

exports.create = async (data) => await db.tbl_mch.create(data);

exports.update = async (id, data) =>
  await db.tbl_mch.update(data, {
    where: {
      id: id,
    },
  });

exports.delete = async (id) =>
  await db.tbl_mch.destroy({
    where: {
      id: id,
    },
  });

exports.getdataganttchart = async (work_center_id, data) =>
  await db.tbl_mch.findAll({
    where: {
      work_center_id,
    },
    order: [
      [db.tbl_opn_ord, "machine_id", "ASC"],
      [db.tbl_opn_ord, "opn_start_date_time", "ASC"],
      [db.tbl_opn_ord, "opn_end_date_time", "ASC"],
    ],
    include: [
      { model: db.company },
      { model: db.tbl_work_center },
      {
        model: db.tbl_opn_ord,
        required: true,
        // '%m/%d/%Y %h:%m:%s'
        attributes: {
          include: [
            [
              db.sequelize.fn(
                "date_format",
                db.sequelize.col("opn_start_date_time"),
                "%Y-%m-%dT%H:%i:%s.000Z"
              ),
              "opn_start_date_time",
            ],
            [
              db.sequelize.fn(
                "date_format",
                db.sequelize.col("opn_end_date_time"),
                "%Y-%m-%dT%H:%i:%s.000Z"
              ),
              "opn_end_date_time",
            ],
            // [db.sequelize.fn('date_format',db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')), '%H.%i.%s'),'duration']
          ],
        },
        where: {
          [Op.and]: [
            db.sequelize.where(
              db.sequelize.fn("MONTH", db.sequelize.col("opn_start_date_time")),
              data.month
            ),
            db.sequelize.where(
              db.sequelize.fn("YEAR", db.sequelize.col("opn_start_date_time")),
              data.year
            ),
          ],
          [Op.and]: [
            db.sequelize.where(
              db.sequelize.fn("MONTH", db.sequelize.col("opn_end_date_time")),
              data.month
            ),
            db.sequelize.where(
              db.sequelize.fn("YEAR", db.sequelize.col("opn_end_date_time")),
              data.year
            ),
          ],
        },
      },
    ],
  });

exports.getdataganttchartday = async (work_center_id, data) =>
  await db.tbl_mch.findAll({
    where: {
      work_center_id,
    },
    order: [
      [db.tbl_opn_ord, "machine_id", "ASC"],
      [db.tbl_opn_ord, "opn_start_date_time", "ASC"],
      [db.tbl_opn_ord, "opn_end_date_time", "ASC"],
    ],
    include: [
      { model: db.company },
      { model: db.tbl_work_center },
      {
        model: db.tbl_opn_ord,
        required: true,
        attributes: {
          include: [
            [
              db.sequelize.fn(
                "date_format",
                db.sequelize.col("opn_start_date_time"),
                "%Y-%m-%dT%H:%i:%s.000Z"
              ),
              "opn_start_date_time",
            ],
            [
              db.sequelize.fn(
                "date_format",
                db.sequelize.col("opn_end_date_time"),
                "%Y-%m-%dT%H:%i:%s.000Z"
              ),
              "opn_end_date_time",
            ],
            // [db.sequelize.fn('date_format',db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')), '%H.%i.%s'),'duration']
          ],
        },
        where: {
          [Op.or]: [
            {
              opn_start_date_time: {
                [Op.between]: [data.datefrom, data.dateto],
              },
            },
            {
              opn_end_date_time: {
                [Op.between]: [data.datefrom, data.dateto],
              },
            },
          ],
        },
      },
    ],
  });


    exports.findBy_MachineID = async (machine_id,company_id) =>
    await db.tbl_mch.findOne({
      where: {
        machine_id:machine_id,
        company_id:company_id,
      },
    });
  