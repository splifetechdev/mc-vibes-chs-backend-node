const db = require("../db/models");
const dayjs = require("dayjs");

exports.getAvailabilityTarget = async ({ start, end, company_id }) => {
  const sql = `
    select 
      tbl_work_center.id,
      tbl_work_center.wc_id, 
      target
    from 
      tbl_kpi_master
      left join tbl_work_center on tbl_work_center.wc_id = tbl_kpi_master.wc_id
    where 
      title_id = 2 and date_start <= '${start}' and date_end >= '${end}'
      AND tbl_work_center.company_id = ${company_id};
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.listAvailabilityKPI = async ({ company_id }) => {
  const sql = `
    select 
      tbl_work_center.id,
      tbl_work_center.wc_id, 
      date_start,
      date_end,
      target
    from 
      tbl_kpi_master
      left join tbl_work_center on tbl_work_center.wc_id = tbl_kpi_master.wc_id
    where 
      title_id = 2 
      AND tbl_work_center.company_id = ${company_id};
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.listPerformanceKPI = async ({ company_id }) => {
  const sql = `
    select 
      tbl_work_center.id,
      tbl_work_center.wc_id, 
      date_start,
      date_end,
      target
    from 
      tbl_kpi_master
      left join tbl_work_center on tbl_work_center.wc_id = tbl_kpi_master.wc_id
    where 
      title_id = 3
      AND tbl_work_center.company_id = ${company_id};
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getPerformance = async ({
  start,
  end,
  company_id,
  wcg_id,
  wc_id,
  ig_id,
  item_id,
  opn_ord_id,
}) => {
  let whereCause = `
    WHERE
    tbl_time_card_detail.time_card_date IS NOT NULL
    AND tbl_time_card_detail.time_card_date BETWEEN '${start} 00:00:00' AND '${end} 23:59:59'
    AND tbl_time_card_detail.wo_running_no IS NOT NULL
    AND tbl_time_card_detail.opn_id IS NOT NULL
    AND tbl_time_card_detail.work_hours > 0
    AND tbl_opn_ord.rtg_id IS NOT NULL
    AND tbl_time_card_detail.downtime_id IS NULL
  `;
  if (wc_id) {
    whereCause += ` AND tbl_work_center.id = ${wc_id}`;
  } else if (wcg_id) {
    whereCause += ` AND tbl_work_center_group.id = ${wcg_id}`;
  }

  if (item_id) {
    whereCause += ` AND item_master.id = ${item_id}`;
  } else if (ig_id) {
    whereCause += ` AND item_master.item_group_id = ${ig_id}`;
  }

  if (opn_ord_id) {
    whereCause += ` AND tbl_time_card_detail.opn_ord_id = ${opn_ord_id}`;
  }
  const sql = `
  SELECT
    tbl_time_card_detail.time_card_date,
    tbl_time_card_detail.wo_running_no,
    tbl_opn_ord.rtg_id,
    tbl_time_card_detail.opn_id,
    tbl_time_card_detail.opn_desc,
    tbl_time_card_detail.item_id,
    item_master.item_name,
    SUM(tbl_time_card_detail.work_hours) as hours,
    SUM(tbl_time_card_detail.work_hours)*tbl_routing.pcs_hr as standard_pcs,
    SUM(tbl_time_card_detail.qty) as actual_pcs,
    tbl_work_center.wc_id,
    tbl_work_center.wc_name
  FROM
    tbl_time_card_detail
    LEFT JOIN tbl_opn_ord on tbl_opn_ord.id = tbl_time_card_detail.opn_ord_id AND tbl_opn_ord.company_id = ${company_id}
    LEFT JOIN item_master on item_master.id = tbl_time_card_detail.item_id AND tbl_opn_ord.company_id = ${company_id}
    LEFT JOIN tbl_work_center on tbl_work_center.id = tbl_time_card_detail.wc_id
    LEFT JOIN tbl_work_center_group on tbl_work_center_group.work_center_group_id = tbl_work_center.wc_group
    LEFT JOIN tbl_routing on tbl_opn_ord.rtg_id = tbl_routing.rtg_id and tbl_time_card_detail.item_id = tbl_routing.item_master_id and tbl_time_card_detail.opn_id = tbl_routing.opn_id
  ${whereCause}
  GROUP BY 
    tbl_time_card_detail.time_card_date,
    tbl_time_card_detail.wo_running_no,
    tbl_time_card_detail.opn_id,
        tbl_time_card_detail.opn_desc,
    tbl_time_card_detail.item_id,
    tbl_routing.pcs_hr,
    item_master.item_name,
    tbl_opn_ord.rtg_id,
    tbl_work_center.wc_id,
    tbl_work_center.wc_name
  ORDER BY
    tbl_time_card_detail.time_card_date DESC;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getMachineAvailabilityData = async ({
  start,
  end,
  company_id,
  wcg_id,
  wc_id,
  mch_id,
}) => {
  let whereCause = "";
  if (wcg_id) {
    whereCause = `AND tbl_work_center_group.id = ${wcg_id}`;
  }
  if (wc_id) {
    whereCause = `AND tbl_work_center.id = ${wc_id}`;
  }
  if (mch_id) {
    whereCause = `AND tbl_mch.id = ${mch_id}`;
  }
  const diffDate = dayjs(end).diff(dayjs(start), "days") || 1;

  const sql = `
    SELECT
      tbl_work_center_group.work_center_group_id,
      tbl_work_center_group.work_center_group_name,
      tbl_work_center.wc_id,
      tbl_work_center.wc_name,
      tbl_mch.machine_id,
      tbl_mch.name,
      time_card_date,
      (tbl_work_center.total_plan_hour * ${diffDate}) - COALESCE(machine_holiday.holiday_hours, 0) AS plan_hours,
      COALESCE(sum(machine_time_card.work_hours), 0) - COALESCE(sum(machine_time_card.downtime_hours), 0) AS run_hours,
      COALESCE(sum(machine_time_card.downtime_hours), 0) as downtime_hours,
      COALESCE(sum(isnull(cast(machine_time_card.setup_time as float),0)), 0) as setup_hours
    FROM
      tbl_mch
      LEFT JOIN tbl_work_center ON tbl_work_center.id = tbl_mch.work_center_id 
      LEFT JOIN tbl_work_center_group on tbl_work_center_group.work_center_group_id = tbl_work_center.wc_group
      LEFT JOIN (
        SELECT
          machine_id,
          sum(
            CASE 
              WHEN holiday_type = 'D' THEN
                8
              WHEN holiday_type = 'I' THEN
                hours * - 1
              ELSE
                hours
            END
          ) AS holiday_hours
        FROM
          tbl_holiday_mch
          LEFT JOIN tbl_holiday ON tbl_holiday_mch.holiday_id = tbl_holiday.id
        WHERE 
          tbl_holiday.date_from BETWEEN '${start} 00:00:00'
          AND '${end} 23:59:59'  
        GROUP BY
          machine_id
      ) AS machine_holiday ON machine_holiday.machine_id = tbl_mch.id
      LEFT JOIN (
        SELECT
          tbl_time_card_detail.id as tc_id,
          tbl_time_card_detail.time_card_date,
          dt.id as dt_id,
          mch_id,
          work_hours,
          setup_time,
          downtime_hours
        FROM
          tbl_time_card_detail
          LEFT JOIN (
            SELECT id, work_hours as downtime_hours
            FROM tbl_time_card_detail
            WHERE downtime_id IS NOT NULL
          ) AS dt ON dt.id = tbl_time_card_detail.id
        WHERE
          tbl_time_card_detail.time_card_date BETWEEN '${start} 00:00:00'
          AND '${end} 23:59:59'
      ) AS machine_time_card ON tbl_mch.id = machine_time_card.mch_id
    WHERE tbl_mch.company_id = ${company_id}
      AND time_card_date IS NOT NULL
      ${whereCause}
    GROUP BY 
      tbl_mch.id, 
      tbl_work_center_group.work_center_group_id,
      tbl_work_center_group.work_center_group_name,
      tbl_work_center.wc_id,
      tbl_work_center.wc_name,
      tbl_mch.machine_id,
      tbl_mch.name,
      time_card_date,
      machine_holiday.holiday_hours,
      tbl_work_center_group.id,
      tbl_work_center.total_plan_hour
    ORDER BY tbl_work_center_group.id DESC;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getDowntime = async ({ start, end, downtime_id, company_id }) => {
  let whereCause = "";
  if (downtime_id) {
    whereCause = `AND tbl_time_card_detail.downtime_id = ${downtime_id}`;
  }

  const sql = `
    SELECT
    TOP 10
      description,
      COALESCE(sum(work_hours), 0) as downtime_hours
    FROM 
      tbl_time_card_detail 
      left join tbl_downtime_cause on tbl_downtime_cause.id = tbl_time_card_detail.downtime_id AND tbl_downtime_cause.company_id = ${company_id}
    WHERE 
        downtime_id is not null and description is not null
        AND tbl_time_card_detail.time_card_date BETWEEN '${start}'
        AND '${end}'
        ${whereCause}
    GROUP BY downtime_id,description
    ORDER BY downtime_hours DESC
    ;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getMachineAvailabilityByMonth = async ({ start, end, company_id }) => {
  const diffDate = dayjs(end).diff(dayjs(start), "days") || 1;
  const sql = `
    SELECT
      tbl_work_center_group.work_center_group_id,
      tbl_work_center_group.work_center_group_name,
      tbl_work_center.wc_id,
      tbl_work_center.wc_name,
      tbl_mch.machine_id,
      tbl_mch.name,
      (tbl_work_center.total_plan_hour * ${diffDate}) - COALESCE(machine_holiday.holiday_hours, 0) AS plan_hours,
      COALESCE(sum(machine_time_card.work_hours), 0) - COALESCE(sum(machine_time_card.downtime_hours), 0) AS run_hours,
      COALESCE(sum(machine_time_card.downtime_hours), 0) as downtime_hours,
      COALESCE(sum(isnull(cast(machine_time_card.setup_time as float),0)), 0) as setup_hours,
      time_card_date
    FROM
      tbl_mch
      LEFT JOIN tbl_work_center ON tbl_work_center.id = tbl_mch.work_center_id
      LEFT JOIN tbl_work_center_group on tbl_work_center_group.work_center_group_id = tbl_work_center.wc_group	
      LEFT JOIN (
        SELECT
          machine_id,
          sum(
            CASE 
              WHEN holiday_type = 'D' THEN
                8
              WHEN holiday_type = 'I' THEN
                hours * - 1
              ELSE
                hours
            END
          ) AS holiday_hours
        FROM
          tbl_holiday_mch
          LEFT JOIN tbl_holiday ON tbl_holiday_mch.holiday_id = tbl_holiday.id
        WHERE 
          tbl_holiday.date_from BETWEEN '${start} 00:00:00'
          AND '${end} 23:59:59'  
        GROUP BY
          machine_id
      ) AS machine_holiday ON machine_holiday.machine_id = tbl_mch.id
      LEFT JOIN (
        SELECT
          tbl_time_card_detail.id as tc_id,
          dt.id as dt_id,
          mch_id,
          work_hours,
          setup_time,
          downtime_hours,
          time_card_date
        FROM
          tbl_time_card_detail
          LEFT JOIN (
            SELECT id, work_hours as downtime_hours
            FROM tbl_time_card_detail
            WHERE downtime_id IS NOT NULL
          ) AS dt ON dt.id = tbl_time_card_detail.id
        WHERE
          tbl_time_card_detail.time_card_date BETWEEN '${start} 00:00:00'
          AND '${end} 23:59:59'
      ) AS machine_time_card ON tbl_mch.id = machine_time_card.mch_id
    WHERE 
      time_card_date is not null  
      AND tbl_mch.company_id = ${company_id}
    GROUP BY 
      MONTH(time_card_date), 
      wc_id, 
      tbl_mch.id, 
      tbl_work_center_group.work_center_group_id, 
      tbl_work_center_group.work_center_group_name,
      tbl_work_center.wc_name,
      tbl_mch.machine_id,
      tbl_mch.name,
      tbl_work_center.total_plan_hour,
      machine_holiday.holiday_hours,
      machine_time_card.work_hours,
      machine_time_card.downtime_hours,
      machine_time_card.setup_time,
      machine_time_card.time_card_date;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getQualityDashboardData = async ({
  start,
  end,
  company_id,
  wc_id,
  wcg_id,
  item_id,
  ig_id,
  opn_ord_id,
}) => {
  let whereCause = `
    WHERE
      time_card_date IS NOT NULL
      AND tbl_time_card_detail.opn_ord_id IS NOT NULL
      AND tbl_time_card_detail.item_id IS NOT NULL
      AND tbl_time_card_detail.wc_id IS NOT NULL
      AND tbl_time_card.company_id = ${company_id}
      AND tbl_time_card_detail.time_card_date BETWEEN '${start} 00:00:00'
      AND '${end} 23:59:59'
  `;
  if (wc_id) {
    whereCause += ` AND tbl_work_center.id = ${wc_id}`;
  } else if (wcg_id) {
    whereCause += ` AND tbl_work_center_group.id = ${wcg_id}`;
  }

  if (item_id) {
    whereCause += ` AND item_master.id = ${item_id}`;
  } else if (ig_id) {
    whereCause += ` AND item_master.item_group_id = ${ig_id}`;
  }

  if (opn_ord_id) {
    whereCause += ` AND tbl_time_card_detail.opn_ord_id = ${opn_ord_id}`;
  }
  const sql = `
    SELECT
      tbl_time_card_detail.time_card_date,
      tbl_work_center.wc_id,
      tbl_time_card_detail.wo_running_no,
      tbl_routing.opn_name,
      tbl_group_item.group_name,
      item_master.item_group_id,
      item_master.item_id,
      item_master.item_name,
      tbl_time_card_detail.qty,
      tbl_time_card_detail.qty - COALESCE(SUM(tbl_time_card_defect.qty), 0) AS good_product_count,
      COALESCE(SUM(tbl_time_card_defect.qty), 0) AS defect_count
    FROM
      tbl_time_card_detail
      LEFT JOIN tbl_opn_ord on tbl_opn_ord.id = tbl_time_card_detail.opn_ord_id
      LEFT JOIN tbl_work_center on tbl_work_center.id = tbl_time_card_detail.wc_id
      LEFT JOIN tbl_work_center_group on tbl_work_center_group.work_center_group_id = tbl_work_center.wc_group
      LEFT JOIN item_master on item_master.id = tbl_time_card_detail.item_id
      LEFT JOIN tbl_group_item on tbl_group_item.id = item_master.item_group_id
      LEFT JOIN tbl_time_card on tbl_time_card.id = tbl_time_card_detail.time_card_id
      LEFT JOIN tbl_time_card_defect ON tbl_time_card_detail.id = tbl_time_card_defect.time_card_log_id
      LEFT JOIN tbl_routing on tbl_routing.opn_id = tbl_opn_ord.opn_id AND tbl_routing.item_master_id = tbl_time_card_detail.item_id AND tbl_routing.rtg_id = tbl_opn_ord.rtg_id 
    ${whereCause}
    GROUP BY
      tbl_time_card_detail.wc_id, 
      tbl_work_center.wc_id,
      tbl_routing.opn_name,
      tbl_time_card_detail.item_id,
      tbl_group_item.group_name,
      tbl_time_card_detail.wo_running_no,
      DAY(time_card_date),
      item_master.item_group_id,
      item_master.item_id,
      tbl_time_card_detail.qty,
      item_master.item_name,
      tbl_time_card_detail.time_card_date
    ORDER BY time_card_date DESC;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getQualityDailyDashboardData = async ({
  start,
  end,
  company_id,
  wc_id,
  wcg_id,
  item_id,
  ig_id,
  opn_ord_id,
}) => {
  let whereCause = `
    WHERE
      time_card_date IS NOT NULL
      AND tbl_time_card_detail.opn_ord_id IS NOT NULL
      AND tbl_time_card_detail.item_id IS NOT NULL
      AND tbl_time_card_detail.wc_id IS NOT NULL
      AND tbl_time_card.company_id = ${company_id}
      AND tbl_time_card_detail.time_card_date BETWEEN '${start} 00:00:00'
      AND '${end} 23:59:59'
  `;
  if (wc_id) {
    whereCause += ` AND tbl_work_center.id = ${wc_id}`;
  } else if (wcg_id) {
    whereCause += ` AND tbl_work_center_group.id = ${wcg_id}`;
  }

  if (item_id) {
    whereCause += ` AND item_master.id = ${item_id}`;
  } else if (ig_id) {
    whereCause += ` AND item_master.item_group_id = ${ig_id}`;
  }

  if (opn_ord_id) {
    whereCause += ` AND tbl_time_card_detail.opn_ord_id = ${opn_ord_id}`;
  }
  const sql = `
    SELECT
      tbl_time_card_detail.time_card_date,
      tbl_time_card_detail.qty,
      COALESCE(SUM(tbl_time_card_defect.qty), 0)AS defect_count,
      tbl_time_card_detail.qty-COALESCE(SUM(tbl_time_card_defect.qty), 0) AS good_product_count
    FROM
        tbl_time_card_detail
      LEFT JOIN tbl_opn_ord on tbl_opn_ord.id = tbl_time_card_detail.opn_ord_id
      LEFT JOIN tbl_work_center on tbl_work_center.id = tbl_time_card_detail.wc_id
      LEFT JOIN item_master on item_master.id = tbl_time_card_detail.item_id
      LEFT JOIN tbl_time_card on tbl_time_card.id = tbl_time_card_detail.time_card_id
      LEFT JOIN tbl_time_card_defect ON tbl_time_card_detail.id = tbl_time_card_defect.time_card_log_id
      LEFT JOIN tbl_routing on tbl_routing.opn_id = tbl_opn_ord.opn_id AND tbl_routing.item_master_id = tbl_time_card_detail.item_id AND tbl_routing.rtg_id = tbl_opn_ord.rtg_id
    ${whereCause}
    GROUP BY
      DAY(time_card_date)
    ORDER BY time_card_date ASC;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getQualityKPI = async ({ start, end, company_id }) => {
  const sql = `
  select 
    tbl_work_center.id,
    tbl_work_center.wc_id, 
    date_start,
    date_end,
    target
  from 
    tbl_kpi_master
    left join tbl_work_center on tbl_work_center.wc_id = tbl_kpi_master.wc_id
  where 
    title_id = 4
    AND tbl_work_center.company_id = ${company_id}
    AND tbl_kpi_master.date_start <= '${start} 00:00:00'
    AND tbl_kpi_master.date_end >= '${end} 23:59:59';
`;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getDefectByWorkCenter = async ({ start, end, company_id }) => {
  const sql = `
    SELECT
      tbl_work_center.id,
      tbl_work_center.wc_id,
      tbl_work_center.wc_name,
      COALESCE(SUM(tbl_time_card_defect.qty), 0) AS defect_count
    FROM
      tbl_work_center 
      LEFT JOIN tbl_time_card_detail ON tbl_work_center.id =  tbl_time_card_detail.wc_id 
      LEFT JOIN tbl_time_card_defect ON tbl_time_card_detail.id = tbl_time_card_defect.time_card_log_id
    WHERE 
      tbl_work_center.company_id = ${company_id}
      AND tbl_time_card_detail.time_card_date BETWEEN '${start} 00:00:00'
      AND '${end} 23:59:59'
    GROUP BY
      tbl_work_center.wc_id,
      tbl_work_center.id,
      tbl_work_center.wc_name;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};

exports.getDefectWithQTY = async ({ start, end, company_id }) => {
  const sql = `
    SELECT 
      tbl_defect_cause.waste_code,
      tbl_defect_cause.description,
      COALESCE(SUM(tbl_time_card_defect.qty), 0) as defect_count
    FROM 
      tbl_time_card_detail
      LEFT JOIN tbl_time_card ON tbl_time_card.id = tbl_time_card_detail.time_card_id
      LEFT JOIN tbl_time_card_defect ON tbl_time_card_defect.time_card_log_id = tbl_time_card_detail.id
      LEFT JOIN tbl_defect_cause ON tbl_defect_cause.id = tbl_time_card_defect.defect_cause_id
    WHERE
      tbl_defect_cause.waste_code IS NOT NULL
      AND tbl_time_card.company_id = ${company_id}
      AND tbl_time_card_detail.time_card_date BETWEEN '${start} 00:00:00'
      AND '${end} 23:59:59'
    GROUP BY 
      tbl_time_card_defect.defect_cause_id,
      tbl_defect_cause.waste_code,
      tbl_defect_cause.description
    ORDER BY 
      defect_count DESC;
  `;
  return await db.sequelize.query(sql, {
    type: db.sequelize.QueryTypes.SELECT,
  });
};
