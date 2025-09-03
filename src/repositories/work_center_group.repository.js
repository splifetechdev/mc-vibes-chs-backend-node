const db = require("../db/models");
const { Op } = require("sequelize");
// const dbquery = require("../db/db");

exports.findWorkCenterGroupAll = async (id) =>
  await db.sequelize.query(
    `SELECT * FROM tbl_work_center_group
     WHERE tbl_work_center_group.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findWorkCenterGroupAndName = async (id) =>
  await db.sequelize.query(
    `SELECT work_center_group_id,
          concat(work_center_group_id,':',work_center_group_name) as work_center_group_name 
          FROM tbl_work_center_group
          WHERE tbl_work_center_group.company_id = :id`,
    {
      replacements: { id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findWorkCenterGroupByMachineId = async (machine_id) =>
  await db.sequelize.query(
    `select mch.id as mch_id,mch.machine_id , wc.id as wc_id 
            ,wc.wc_name ,wc.wc_group,wcg.work_center_group_id,wcg.work_center_group_name
        from tbl_mch mch
        left join tbl_work_center wc
        on mch.work_center_id = wc.id
        left join tbl_work_center_group wcg
        on wc.wc_group = wcg.work_center_group_id
        where mch.machine_id= :machine_id`,
    {
      replacements: { machine_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findWorkCenterGroupAllByID = async (id, u_define_id) =>
  await db.sequelize.query(
    `SELECT w.*,udm.* 
        FROM tbl_work_center_group w
        LEFT JOIN u_define_master udm 
        ON  w.id=udm.module_master_id
        and udm.u_define_module_id = :u_define_id
        WHERE w.id = :id`,
    {
      replacements: { id, u_define_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListByCompany = async (company_id) =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        work_center_group_id,
        work_center_group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_work_center_group
     WHERE tbl_work_center_group.company_id = :company_id`,
    {
      replacements: { company_id },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.findListAll = async () =>
  await db.sequelize.query(
    `SELECT 
        CONVERT(id, CHAR(50)) as id,
        work_center_group_id,
        work_center_group_name,
        CONVERT(company_id, CHAR(50)) as companyId,
        created_at as createdAt,
        updated_at as updatedAt 
        FROM tbl_work_center_group`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.getAlldata = async () =>
  await db.sequelize.query(
    `SELECT d.id,d.work_center_group_id as work_center_group_id,
        d.company_id,
        c.code AS company_code,
        d.work_center_group_name  AS work_center_group_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_work_center_group d 
        LEFT JOIN company c ON d.company_id = c.id`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.create = async (data) => await db.tbl_work_center_group.create(data);

exports.update = async (id, data) =>
  await db.tbl_work_center_group.update(data, {
    where: {
      id: id,
    },
  });

exports.getAlldatabycompany = async (id) =>
  await db.sequelize.query(
    `SELECT d.id,d.work_center_group_id as work_center_group_id,
        d.company_id,
        c.code AS company_code,
        d.work_center_group_name  AS work_center_group_name,
        c.name_th AS company_name,
        c.status 
        FROM tbl_work_center_group d 
        LEFT JOIN company c ON d.company_id = c.id
        WHERE d.company_id=${id}`,
    {
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

exports.delete = async (id) =>
  await db.tbl_work_center_group.destroy({
    where: {
      id: id,
    },
  });

exports.findWorkCenterAllforganttchart = async (id, data) =>
  await db.tbl_work_center_group.findAll({
    where: {
      company_id: id,
      [Op.and]: [data.work_center_group && { id: data.work_center_group }],
    },
    order: [
      [db.tbl_work_center, db.tbl_mch, db.tbl_opn_ord, "machine_id", "ASC"],
      [
        db.tbl_work_center,
        db.tbl_mch,
        db.tbl_opn_ord,
        "opn_start_date_time",
        "ASC",
      ],
      [
        db.tbl_work_center,
        db.tbl_mch,
        db.tbl_opn_ord,
        "opn_end_date_time",
        "ASC",
      ],
    ],
    // group: [
    //   ['id'],
    // ],

    include: [
      {
        model: db.tbl_work_center,
        required: true,
        where: {
          [Op.and]: [data.work_center && { id: data.work_center }],
        },
        include: [
          {
            model: db.tbl_mch,
            required: true,
            where: {
              [Op.and]: [data.machine && { id: data.machine }],
            },
            include: [
              {
                model: db.tbl_opn_ord,
                required: true,

                attributes: {
                  include: [
                    // [db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')),'duration'],
                    [
                      db.sequelize.fn(
                        "date_format",
                        db.sequelize.col("opn_start_date_time"),
                        "%Y-%m-%d %H:%i:%s"
                      ),
                      "opn_start_date_time",
                    ],
                    [
                      db.sequelize.fn(
                        "date_format",
                        db.sequelize.col("opn_end_date_time"),
                        "%Y-%m-%d %H:%i:%s"
                      ),
                      "opn_end_date_time",
                    ],
                  ],
                },
                where: {
                  [Op.and]: [
                    db.sequelize.where(
                      db.sequelize.fn(
                        "MONTH",
                        db.sequelize.col("opn_start_date_time")
                      ),
                      data.month
                    ),
                    db.sequelize.where(
                      db.sequelize.fn(
                        "YEAR",
                        db.sequelize.col("opn_start_date_time")
                      ),
                      data.year
                    ),
                  ],
                  [Op.and]: [
                    db.sequelize.where(
                      db.sequelize.fn(
                        "MONTH",
                        db.sequelize.col("opn_end_date_time")
                      ),
                      data.month
                    ),
                    db.sequelize.where(
                      db.sequelize.fn(
                        "YEAR",
                        db.sequelize.col("opn_end_date_time")
                      ),
                      data.year
                    ),
                  ],
                },
                // order: [
                //   ['id', 'ASC'],
                // ],
              },
            ],
          },
        ],
      },
    ],
  });

exports.findWorkCenterAllforganttchartday = async (id, data) =>
  await db.tbl_work_center_group.findAll({
    where: {
      company_id: id,
      [Op.and]: [data.work_center_group && { id: data.work_center_group }],
    },
    order: [
      [db.tbl_work_center, db.tbl_mch, db.tbl_opn_ord, "machine_id", "ASC"],
      [
        db.tbl_work_center,
        db.tbl_mch,
        db.tbl_opn_ord,
        "opn_start_date_time",
        "ASC",
      ],
      [
        db.tbl_work_center,
        db.tbl_mch,
        db.tbl_opn_ord,
        "opn_end_date_time",
        "ASC",
      ],
    ],
    // group: [
    //   ['id'],
    // ],
    include: [
      {
        model: db.tbl_work_center,
        required: true,
        where: {
          [Op.and]: [data.work_center && { id: data.work_center }],
        },
        include: [
          {
            model: db.tbl_mch,
            required: true,
            where: {
              [Op.and]: [data.machine && { id: data.machine }],
            },
            include: [
              {
                model: db.tbl_opn_ord,
                required: true,
                attributes: {
                  include: [
                    // [db.sequelize.fn('timediff',db.sequelize.col('opn_end_date_time'),db.sequelize.col('opn_start_date_time')),'duration'],
                    [
                      db.sequelize.fn(
                        "date_format",
                        db.sequelize.col("opn_start_date_time"),
                        "%Y-%m-%d %H:%i:%s"
                      ),
                      "opn_start_date_time",
                    ],
                    [
                      db.sequelize.fn(
                        "date_format",
                        db.sequelize.col("opn_end_date_time"),
                        "%Y-%m-%d %H:%i:%s"
                      ),
                      "opn_end_date_time",
                    ],
                  ],
                },
                where: {
                  [Op.or]: [
                    {
                      opn_start_date_time: {
                        [Op.lte]: data.datefrom,
                      },
                      opn_end_date_time: {
                        [Op.gte]: data.datefrom,
                      },
                    },
                    {
                      opn_start_date_time: {
                        [Op.lte]: data.dateto,
                      },
                      opn_end_date_time: {
                        [Op.gte]: data.dateto,
                      },
                    },
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
                // [Op.or]: [
                //   {
                //   opn_start_date_time: {
                //     [Op.between]: [data.datefrom, data.dateto]
                //   }
                // }, {
                //   opn_end_date_time: {
                //     [Op.between]: [data.datefrom, data.dateto]
                //   }
                // }]
                // },
                order: [["id", "ASC"]],
              },
            ],
          },
        ],
      },
    ],
  });

exports.findBywork_center_group_id = async (work_center_group_id,company_id) =>
await db.tbl_work_center_group.findOne({
  where: {
   work_center_group_id:work_center_group_id,
    company_id:company_id,
  },
});