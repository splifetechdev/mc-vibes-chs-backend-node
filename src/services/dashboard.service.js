const dashboardRepository = require("../repositories/dashboard.repository");

exports.getMachineAvailability = async ({
  start,
  end,
  downtime_id,
  wcg_id,
  wc_id,
  mch_id,
  company_id,
}) =>
  await dashboardRepository.getMachineAvailabilityData({
    start,
    end,
    downtime_id,
    wcg_id,
    wc_id,
    mch_id,
    company_id,
  });

exports.getPerformance = async ({
  start,
  end,
  company_id,
  wcg_id,
  wc_id,
  ig_id,
  item_id,
  opn_ord_id,
}) =>
  await dashboardRepository.getPerformance({
    start,
    end,
    company_id,
    wcg_id,
    wc_id,
    ig_id,
    item_id,
    opn_ord_id,
  });

exports.getAvailabilityTarget = async ({ start, end, company_id }) =>
  await dashboardRepository.getAvailabilityTarget({ start, end, company_id });

exports.getAvailabilityKPI = async ({ company_id }) =>
  await dashboardRepository.listAvailabilityKPI({ company_id });

exports.getPerformanceKPI = async ({ company_id }) =>
  await dashboardRepository.listPerformanceKPI({ company_id });

exports.getDowntime = async ({ start, end, downtime_id, company_id }) =>
  await dashboardRepository.getDowntime({
    start,
    end,
    downtime_id,
    company_id,
  });

exports.getMachineAvailabilityByMonth = async ({ start, end, company_id }) =>
  await dashboardRepository.getMachineAvailabilityByMonth({
    start,
    end,
    company_id,
  });

exports.getQualityDashboardData = async ({
  start,
  end,
  company_id,
  wc_id,
  wcg_id,
  item_id,
  ig_id,
  opn_ord_id,
}) =>
  await dashboardRepository.getQualityDashboardData({
    start,
    end,
    company_id,
    wc_id,
    wcg_id,
    item_id,
    ig_id,
    opn_ord_id,
  });

exports.getQualityDailyDashboardData = async ({
  start,
  end,
  company_id,
  wc_id,
  wcg_id,
  item_id,
  ig_id,
  opn_ord_id,
}) =>
  await dashboardRepository.getQualityDailyDashboardData({
    start,
    end,
    company_id,
    wc_id,
    wcg_id,
    item_id,
    ig_id,
    opn_ord_id,
  });

exports.getQualityKPI = async ({ start, end, company_id }) =>
  await dashboardRepository.getQualityKPI({ start, end, company_id });

exports.getDefectByWorkCenter = async ({ start, end, company_id }) =>
  await dashboardRepository.getDefectByWorkCenter({ start, end, company_id });

exports.getDefectWithQTY = async ({ start, end, company_id }) =>
  await dashboardRepository.getDefectWithQTY({ start, end, company_id });
