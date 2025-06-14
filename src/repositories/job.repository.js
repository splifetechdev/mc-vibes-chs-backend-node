const db = require("../db/models");
const { Op, where } = require("sequelize");
const tbl_job = require("../db/models/tbl_job");

exports.find_pending_job = async (company_id) =>
  await db.tbl_opn_ord.findAll({
    where: {
      company_id,
      prod_status: "N",
    },
    include: [
      db.item_master,
      {
        model: db.tbl_mch,
        include: [db.tbl_work_center],
      },
      {
        model: db.tbl_job,
        include: [db.tbl_job_worker],
        required: false,
      },
    ],
  });

exports.find_starting_job = async (company_id) =>
  await db.tbl_opn_ord.findAll({
    where: {
      company_id,
      prod_status: "S",
    },
    include: [
      db.item_master,
      {
        model: db.tbl_mch,
        include: [db.tbl_work_center],
      },
      {
        model: db.tbl_job,
        where: {
          is_done: false,
        },
        include: [db.tbl_job_worker],
        required: true,
      },
    ],
  });

exports.find_end_job = async (company_id) =>
  await db.tbl_opn_ord.findAll({
    where: {
      company_id,
      prod_status: "S",
    },
    include: [
      db.item_master,
      {
        model: db.tbl_mch,
        include: [db.tbl_work_center],
      },
      {
        model: db.tbl_job,
        where: {
          is_done: true,
        },
        include: [db.tbl_job_worker],
        required: true,
      },
    ],
  });

exports.create = async (data) => {
  const opnOrd = await db.tbl_opn_ord.findOne({
    where: { id: data.opn_ord_id },
  });
  opnOrd.prod_status = "S";
  await opnOrd.save();
  return await db.tbl_job.create(data);
};

exports.update = async (data) => {
  // const opnOrd = await db.tbl_opn_ord.findOne({
  //   where: { id: data.opn_ord_id },
  // });
  // opnOrd.prod_status = "E";
  // await opnOrd.save();
  return await db.tbl_job.update(
    { ...data, is_done: true },
    {
      where: { id: data.id },
    }
  );
};

exports.latestJobByUser = async (requester_id) =>
  await db.tbl_job.findOne({
    where: {
      created_by: requester_id,
    },
    include: [db.tbl_mch],
    order: [["created_at", "DESC"]],
  });

exports.findjobbymch_idanddate_time = async (data) =>
  await db.tbl_job.findAll({
    where: {
      mch_id: data.machine,
      [Op.or]: [
        {
          start_at: {
            [Op.lte]: data.datefrom,
          },
          end_at: {
            [Op.gte]: data.datefrom,
          },
        },
        {
          start_at: {
            [Op.lte]: data.dateto,
          },
          end_at: {
            [Op.gte]: data.dateto,
          },
        },
        {
          start_at: {
            [Op.between]: [data.datefrom, data.dateto],
          },
        },
        {
          end_at: {
            [Op.between]: [data.datefrom, data.dateto],
          },
        },
      ],
    },
    attributes: {
      include: [
        // [db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')),'duration'],
        [
          db.sequelize.fn(
            "date_format",
            db.sequelize.col("start_at"),
            "%Y-%m-%d %H:%i:%s"
          ),
          "start_at",
        ],
        [
          db.sequelize.fn(
            "date_format",
            db.sequelize.col("end_at"),
            "%Y-%m-%d  %H:%i:%s"
          ),
          "end_at",
        ],
      ],
    },
    include: [
      { model: db.tbl_mch },
      {
        model: db.tbl_opn_ord,
        required: true,
        where: {
          prod_status: {
            [Op.in]: ["S", "E"],
          },
        },
      },
    ],
  });
