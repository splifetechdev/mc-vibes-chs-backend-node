const dashboardService = require("../services/dashboard.service");
const WorkCenterService = require("../services/work_center.service");
const dayjs = require("dayjs");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

const getSplittedPeriod = (startDateStr, endDateStr) => {
  const startDate = dayjs(startDateStr);
  const endDate = dayjs(endDateStr);
  const subPeriods = [];
  let currentMonthStart = startDate;
  while (
    currentMonthStart.isBefore(endDate) ||
    currentMonthStart.isSame(endDate, "month")
  ) {
    const currentMonthEnd = currentMonthStart.endOf("month").isBefore(endDate)
      ? currentMonthStart.endOf("month")
      : endDate;
    subPeriods.push([
      currentMonthStart.format("YYYY-MM-DD"),
      currentMonthEnd.format("YYYY-MM-DD"),
    ]);
    currentMonthStart = currentMonthStart.add(1, "month").startOf("month");
  }

  return subPeriods;
};

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = dayjs(startDate);

  while (currentDate.isSameOrBefore(endDate, "day")) {
    dates.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};

const isDateInPeriod = (startDate, endDate, dateToCheck) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const checkDate = dayjs(dateToCheck);

  return checkDate.isBetween(start, end, null, "[]"); // '[]' includes start and end dates
};

exports.getPerformanceDailyWithTarget = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const workCenterPerformanceKPI = await dashboardService.getPerformanceKPI({
      company_id: requester_company_id,
    });
    const dates = getDatesInRange(startDate, endDate);
    const diffDate = dayjs(endDate).diff(dayjs(startDate), "days") || 1;
    const dailyPerformanceWithTarget = await Promise.all(
      dates.map(async (date) => {
        const dailyPerformances = await dashboardService.getPerformance({
          start: date,
          end: date,
          company_id: requester_company_id,
        });
        const performance = dailyPerformances.reduce(
          (acc, dailyPerformanceData) => {
            acc.hours += Number(dailyPerformanceData.hours);
            acc.standard_pcs += Number(dailyPerformanceData.standard_pcs);
            acc.actual_pcs += Number(dailyPerformanceData.actual_pcs);
            return acc;
          },
          {
            hours: 0,
            standard_pcs: 0,
            actual_pcs: 0,
          }
        );
        const performanceKPI = workCenterPerformanceKPI.filter(
          (workCenterKPI) =>
            isDateInPeriod(
              workCenterKPI.date_start,
              workCenterKPI.date_end,
              date
            )
        );
        const targetList = performanceKPI.map((kpi) => kpi.target);
        const targetSum = targetList.reduce((acc, cur) => acc + Number(cur), 0);
        const avgTarget = targetSum / targetList.length;

        return {
          target: avgTarget,
          hours: performance.hours,
          // standard_pcs: performance.standard_pcs * diffDate,
          standard_pcs: performance.standard_pcs,
          actual_pcs: performance.actual_pcs,
          performance:
            Math.round(
              (performance.actual_pcs / performance.standard_pcs) * 100 * 100
            ) / 100 || 0,
          date: date,
        };
      })
    );

    const maxStandardPcs = dailyPerformanceWithTarget.sort(
      (a, b) => a.standard_pcs - b.standard_pcs
    )[dailyPerformanceWithTarget.length - 1].standard_pcs;
    const result = [];
    dailyPerformanceWithTarget
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      .forEach((dailyPerformance, idx) => {
        const passDayResult = result[idx - 1];
        if (!passDayResult) {
          result.push({
            target: dailyPerformance.target,
            standard_pcs: dailyPerformance.standard_pcs,
            actual_pcs: dailyPerformance.actual_pcs,
            hours: dailyPerformance.hours,
            date: dailyPerformance.date,
            performance:
              Math.round(
                (dailyPerformance.actual_pcs / dailyPerformance.standard_pcs) *
                  100 *
                  100
              ) / 100 || 0,
          });
          return;
        }
        const sumActualPcs =
          dailyPerformance.actual_pcs + passDayResult.actual_pcs;
        result.push({
          target: dailyPerformance.target,
          standard_pcs: dailyPerformance.standard_pcs,
          actual_pcs: dailyPerformance.actual_pcs,
          hours: dailyPerformance.hours,
          date: dailyPerformance.date,
          performance:
            Math.round(
              (dailyPerformance.actual_pcs / dailyPerformance.standard_pcs) *
                100 *
                100
            ) / 100 || 0,
        });
      });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getAvailabilityTarget = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const workCenterAvailabilityKPI = await dashboardService.getAvailabilityKPI(
      { company_id: requester_company_id }
    );
    const dates = getDatesInRange(startDate, endDate);
    const diffDate = dayjs(endDate).diff(dayjs(startDate), "days") || 1;

    const dailyAvailabilityWithTarget = await Promise.all(
      dates.map(async (date) => {
        const dailyMachineAvailabilities =
          await dashboardService.getMachineAvailability({
            start: date,
            end: date,
            downtime_id: null,
            wcg_id: null,
            wc_id: null,
            mch_id: null,
            company_id: requester_company_id,
          });

        const availability = dailyMachineAvailabilities.reduce(
          (acc, machineAvailability) => {
            acc.total_plan_hours +=
              Number(machineAvailability.plan_hours) * diffDate;
            acc.total_run_hours += Number(machineAvailability.run_hours);
            return acc;
          },
          {
            total_plan_hours: 0,
            total_run_hours: 0,
          }
        );
        const availabilityKPI = workCenterAvailabilityKPI.filter(
          (workCenterKPI) =>
            isDateInPeriod(
              workCenterKPI.date_start,
              workCenterKPI.date_end,
              date
            )
        );
        const targetList = availabilityKPI.map((kpi) => kpi.target);
        const targetSum = targetList.reduce((acc, cur) => acc + Number(cur), 0);
        const avgTarget = targetSum / targetList.length;
        return {
          target: avgTarget,
          total_plan_hours: availability.total_plan_hours,
          total_run_hours: availability.total_run_hours,
          availability:
            Math.round(
              (availability.total_run_hours / availability.total_plan_hours) *
                100 *
                100
            ) / 100 || 0,
          date: date,
        };
      })
    );

    const result = [];
    const maxPlanHours = dailyAvailabilityWithTarget.sort(
      (a, b) => a.total_plan_hours - b.total_plan_hours
    )[dailyAvailabilityWithTarget.length - 1].total_plan_hours;
    dailyAvailabilityWithTarget
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      .forEach((dailyAvailableData, idx) => {
        const passDayResult = result[idx - 1];
        if (!passDayResult) {
          result.push({
            target: dailyAvailableData.target,
            total_plan_hours: dailyAvailableData.total_plan_hours,
            total_run_hours: dailyAvailableData.total_run_hours,
            date: dailyAvailableData.date,
            availability:
              Math.round(
                (dailyAvailableData.total_run_hours /
                  dailyAvailableData.total_plan_hours) *
                  100 *
                  100
              ) / 100 || 0,
          });
          return;
        }
        const sumRunHours =
          dailyAvailableData.total_run_hours + passDayResult.total_run_hours;
        result.push({
          target: dailyAvailableData.target,
          total_plan_hours: dailyAvailableData.total_plan_hours,
          total_run_hours: dailyAvailableData.total_run_hours,
          date: dailyAvailableData.date,
          availability:
            Math.round(
              (dailyAvailableData.total_run_hours /
                dailyAvailableData.total_plan_hours) *
                100 *
                100
            ) / 100 || 0,
        });
      });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getDowntime = async (req, res) => {
  try {
    const { start, end, downtime_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const downtimes = await dashboardService.getDowntime({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
      downtime_id,
    });
    res.json(
      downtimes.map((downtime) => ({
        ...downtime,
        downtime_hours: Math.round(downtime.downtime_hours * 100) / 100,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getMonthlyPerformanceDashboard = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const subSplittedPeriods = getSplittedPeriod(startDate, endDate);

    const monthlyPerformanceDashboard = await Promise.all(
      subSplittedPeriods.map(async (period) => {
        const [startDateByMonth, endDateByMonth] = period;
        return {
          month: dayjs(startDateByMonth).format("MMM"),
          data: await dashboardService.getPerformance({
            start: startDateByMonth,
            end: endDateByMonth,
            company_id: requester_company_id,
          }),
        };
      })
    );

    const monthlyPerformanceResult = monthlyPerformanceDashboard.map(
      (monthlyData) => {
        return monthlyData.data.reduce(
          (acc, cur) => {
            const month = dayjs(cur.time_card_date).format("MMM");
            acc.total_hours += Number(cur.hours);
            acc.total_standard_pcs += Number(cur.standard_pcs);
            acc.total_actual_pcs += Number(cur.actual_pcs);
            acc.time_card_date = cur.time_card_date;
            acc.month = month;
            return acc;
          },
          {
            total_hours: 0,
            total_standard_pcs: 0,
            total_actual_pcs: 0,
            time_card_date: 0,
            time_card_date: "",
            month: monthlyData.month,
          }
        );
      }
    );

    // const result = await dashboardService.getPerformance({
    //   start: startDate,
    //   end: endDate,
    //   company_id: requester_company_id
    // })

    // const monthlyData = result.reduce((acc, cur) => {
    //   const month = dayjs(cur.time_card_date).format("MMM")
    //   const foundMonth = acc.find(data => data.month === month)
    //   if (foundMonth) {
    //     foundMonth.total_hours += Number(cur.hours)
    //     foundMonth.total_standard_pcs += Number(cur.standard_pcs)
    //     foundMonth.total_actual_pcs += Number(cur.actual_pcs)
    //   } else {
    //     const data = {
    //       total_hours: Number(cur.hours),
    //       total_standard_pcs: Number(cur.standard_pcs),
    //       total_actual_pcs: Number(cur.actual_pcs),
    //       time_card_date: cur.time_card_date,
    //       month: month
    //     }
    //     acc.push(data)
    //   }
    //   return acc
    // }, [])
    // res.json(monthlyData.map(data => ({ ...data, performance: Math.round(((data.total_actual_pcs / data.total_standard_pcs) * 100) * 100) / 100 || 0 })))
    res.json(
      monthlyPerformanceResult.map((data) => ({
        ...data,
        performance:
          Math.round(
            (data.total_actual_pcs / data.total_standard_pcs) * 100 * 100
          ) / 100 || 0,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getWorkCenterPerformanceDashboard = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const result = await dashboardService.getPerformance({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
    });
    const workCenterData = result.reduce((acc, cur) => {
      const foundWC = acc.find((data) => data.wc_id === cur.wc_id);
      if (foundWC) {
        foundWC.total_hours += Number(cur.hours);
        foundWC.total_standard_pcs += Number(cur.standard_pcs);
        foundWC.total_actual_pcs += Number(cur.actual_pcs);
      } else {
        const data = {
          total_hours: Number(cur.hours),
          total_standard_pcs: Number(cur.standard_pcs),
          total_actual_pcs: Number(cur.actual_pcs),
          time_card_date: cur.time_card_date,
          wc_name: cur.wc_name,
          wc_id: cur.wc_id,
        };
        acc.push(data);
      }
      return acc;
    }, []);
    res.json(
      workCenterData.map((data) => ({
        ...data,
        performance:
          Math.round(
            (data.total_actual_pcs / data.total_standard_pcs) * 100 * 100
          ) / 100 || 0,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getPerformanceDashboard = async (req, res) => {
  try {
    const { start, end, wcg_id, wc_id, ig_id, item_id, opn_ord_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const result = await dashboardService.getPerformance({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
      wcg_id,
      wc_id,
      ig_id,
      item_id,
      opn_ord_id,
    });
    res.json(
      result.map((result) => ({
        ...result,
        opn_desc: `${result.opn_id} ${result.opn_desc || ""}`,
        hours: Number(result.hours).toFixed(2),
        standard_pcs: Number(result.standard_pcs),
        actual_pcs: Number(result.actual_pcs),
        performance:
          Math.round((result.actual_pcs / result.standard_pcs) * 100 * 100) /
          100,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const { start, end, downtime_id, wcg_id, wc_id, mch_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const machineAvailabilityData =
      await dashboardService.getMachineAvailability({
        start: startDate,
        end: endDate,
        company_id: requester_company_id,
        downtime_id,
        wcg_id,
        wc_id,
        mch_id,
      });

    const machineAvailabilityByMachine = machineAvailabilityData.reduce(
      (acc, cur) => {
        const foundMachine = acc.find(
          (data) => data.machine_id === cur.machine_id
        );
        if (foundMachine) {
          foundMachine.total_plan_hours += Number(cur.plan_hours);
          foundMachine.total_run_hours += Number(cur.run_hours);
          foundMachine.count += 1;
        } else {
          acc.push({
            ...cur,
            count: 1,
            machine_id: cur.machine_id,
            machine_name: cur.name,
            total_plan_hours: Number(cur.plan_hours),
            total_run_hours: Number(cur.run_hours),
          });
        }
        return acc;
      },
      []
    );

    const result = machineAvailabilityByMachine.map((data) => ({
      ...data,
      machine_id: data.machine_id,
      machine_name: data.machine_name,
      average_plan_hours: (data.total_plan_hours / data.count).toFixed(2),
      average_run_hours: (data.total_run_hours / data.count).toFixed(2),
      work_center_group: `${data.work_center_group_id}:${data.work_center_group_name}`,
      work_center: `${data.wc_id}:${data.wc_name}`,
      machine: `${data.machine_id}:${data.name}`,
    }));

    res.json(
      // result
      result.map((data) => ({
        ...data,
        work_center_group: `${data.work_center_group_id}:${data.work_center_group_name}`,
        work_center: `${data.wc_id}:${data.wc_name}`,
        machine: `${data.machine_id}:${data.name}`,
        availability:
          Math.round(
            (data.average_run_hours / data.average_plan_hours) * 100 * 100
          ) / 100 || 0,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getByMonth = async (req, res) => {
  try {
    const { start, end, downtime_id, wcg_id, wc_id, mch_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const subSplittedPeriods = getSplittedPeriod(startDate, endDate);
    const availabilityDataByMonths = await Promise.all(
      subSplittedPeriods.map(async (period) => {
        const [startDateByMonth, endDateByMonth] = period;
        return {
          month: dayjs(startDateByMonth).format("MMM"),
          data: await dashboardService.getMachineAvailabilityByMonth({
            start: startDateByMonth,
            end: endDateByMonth,
            company_id: requester_company_id,
            downtime_id,
            wcg_id,
            wc_id,
            mch_id,
          }),
        };
      })
    );
    const result = availabilityDataByMonths.map((monthlyData) => {
      return monthlyData.data.reduce(
        (acc, cur) => {
          const month = dayjs(cur.time_card_date).format("MMM");
          acc.total_plan_hours += Number(cur.plan_hours);
          acc.total_run_hours += Number(cur.run_hours);
          (acc.time_card_date = cur.time_card_date), (acc.month = month);
          return acc;
        },
        {
          total_plan_hours: 0,
          total_run_hours: 0,
          time_card_date: "",
          month: monthlyData.month,
        }
      );
    });

    res.json(
      result.map((data) => ({
        ...data,
        availability:
          Math.round(
            (data.total_run_hours / data.total_plan_hours) * 100 * 100
          ) / 100 || 0,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getQualityDashboardData = async (req, res) => {
  try {
    const { start, end, wcg_id, wc_id, ig_id, item_id, opn_ord_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const qualityData = await dashboardService.getQualityDashboardData({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
      wcg_id,
      wc_id,
      ig_id,
      item_id,
      opn_ord_id,
    });
    const result = qualityData.map((quality) => {
      const defect_count = Number(quality.defect_count);
      const good_product_count = Number(quality.good_product_count);
      const qty = Number(quality.qty);
      const quality_rate =
        Math.round((good_product_count / qty) * 100 * 100) / 100 || 0;
      const defect_rate =
        Math.round((defect_count / good_product_count) * 100 * 100) / 100 || 0;
      return {
        ...quality,
        defect_rate: defect_rate.toFixed(2),
        quality_rate: quality_rate.toFixed(2),
      };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getQualityDailyDashboardData = async (req, res) => {
  try {
    const { start, end, wcg_id, wc_id, ig_id, item_id, opn_ord_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const qualityKPI = await dashboardService.getPerformanceKPI({
      company_id: requester_company_id,
    });
    const targetList = qualityKPI.map((kpi) => kpi.target);
    const targetSum = targetList.reduce((acc, cur) => acc + Number(cur), 0);
    const avgTarget = targetSum / targetList.length;
    const qualityData = await dashboardService.getQualityDashboardData({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
      wcg_id,
      wc_id,
      ig_id,
      item_id,
      opn_ord_id,
    });
    const dates = getDatesInRange(startDate, endDate);

    const result = dates.map((date) => {
      const data = qualityData.find(
        ({ time_card_date }) =>
          dayjs(time_card_date).format("YYYY-MM-DD") === date
      );
      let good_product_count = 0;
      let qty = 0;
      if (data) {
        good_product_count = data.good_product_count;
        qty = data.qty;
      }
      const quality_rate =
        Math.round((good_product_count / qty) * 100 * 100) / 100 || 0;
      return {
        date,
        target: avgTarget.toFixed(2),
        quality_rate: quality_rate.toFixed(2),
      };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getDefectByWorkCenter = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const result = await dashboardService.getDefectByWorkCenter({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getQualityDashboardByItemGroup = async (req, res) => {
  try {
    const { start, end, wcg_id, wc_id, ig_id, item_id, opn_ord_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const qualityData = await dashboardService.getQualityDashboardData({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
      wcg_id,
      wc_id,
      ig_id,
      item_id,
      opn_ord_id,
    });
    const qualityByItemGroupData = qualityData.reduce((acc, cur) => {
      const foundItemGroup = acc.find(
        (itemGroup) => itemGroup.item_group_id === cur.item_group_id
      );
      if (foundItemGroup) {
        foundItemGroup.total_good_product_count += Number(
          cur.good_product_count
        );
        foundItemGroup.total_qty += Number(cur.qty);
        return acc;
      } else {
        return [
          ...acc,
          {
            item_group_id: cur.item_group_id,
            item_group_name: cur.group_name,
            total_good_product_count: Number(cur.good_product_count),
            total_qty: Number(cur.qty),
          },
        ];
      }
    }, []);
    const result = qualityByItemGroupData.map((qualityByItemGroup) => {
      const good_product_count = Number(
        qualityByItemGroup.total_good_product_count
      );
      const qty = Number(qualityByItemGroup.total_qty);
      const quality_rate =
        Math.round((good_product_count / qty) * 100 * 100) / 100 || 0;
      return {
        ...qualityByItemGroup,
        quality_rate: quality_rate.toFixed(2),
      };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getQualityDashboardByItem = async (req, res) => {
  try {
    const { start, end, wcg_id, wc_id, ig_id, item_id, opn_ord_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const qualityData = await dashboardService.getQualityDashboardData({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
      wcg_id,
      wc_id,
      ig_id,
      item_id,
      opn_ord_id,
    });
    const qualityByItem = qualityData.reduce((acc, cur) => {
      const foundItem = acc.find((item) => item.item_id === cur.item_id);
      if (foundItem) {
        foundItem.total_good_product_count += Number(cur.good_product_count);
        foundItem.total_qty += Number(cur.qty);
        return acc;
      } else {
        return [
          ...acc,
          {
            item_id: cur.item_id,
            item_name: cur.item_name,
            total_good_product_count: Number(cur.good_product_count),
            total_qty: Number(cur.qty),
          },
        ];
      }
    }, []);
    const result = qualityByItem.map((qualityByItemGroup) => {
      const good_product_count = Number(
        qualityByItemGroup.total_good_product_count
      );
      const qty = Number(qualityByItemGroup.total_qty);
      const quality_rate =
        Math.round((good_product_count / qty) * 100 * 100) / 100 || 0;
      return {
        ...qualityByItemGroup,
        quality_rate: quality_rate.toFixed(2),
      };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getTop10Defect = async (req, res) => {
  try {
    const { start, end } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const defects = await dashboardService.getDefectWithQTY({
      start: startDate,
      end: endDate,
      company_id: requester_company_id,
    });
    res.json(defects.slice(0, 10));
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.getOEEData = async (req, res) => {
  try {
    const { start, end, wcg_id, wc_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const [availabilityData, performanceData, qualityData] = await Promise.all([
      dashboardService.getMachineAvailability({
        start: startDate,
        end: endDate,
        company_id: requester_company_id,
        wcg_id,
        wc_id,
      }),
      dashboardService.getPerformance({
        start: startDate,
        end: endDate,
        company_id: requester_company_id,
        wcg_id,
        wc_id,
      }),
      dashboardService.getQualityDashboardData({
        start: startDate,
        end: endDate,
        company_id: requester_company_id,
        wcg_id,
        wc_id,
      }),
    ]);

    const availabilityByWC = availabilityData.reduce((acc, cur) => {
      const foundWC = acc.find((wc) => wc.wc_id === cur.wc_id);
      if (foundWC) {
        foundWC.plan_hours += Number(cur.plan_hours);
        foundWC.run_hours += Number(cur.run_hours);
        return acc;
      } else {
        return [
          ...acc,
          {
            wc_id: cur.wc_id,
            plan_hours: Number(cur.plan_hours),
            run_hours: Number(cur.run_hours),
          },
        ];
      }
    }, []);

    const performanceByWC = performanceData.reduce((acc, cur) => {
      const foundWC = acc.find((wc) => wc.wc_id === cur.wc_id);
      if (foundWC) {
        foundWC.standard_pcs += Number(cur.standard_pcs);
        foundWC.actual_pcs += Number(cur.actual_pcs);
        return acc;
      } else {
        return [
          ...acc,
          {
            wc_id: cur.wc_id,
            standard_pcs: Number(cur.standard_pcs),
            actual_pcs: Number(cur.actual_pcs),
          },
        ];
      }
    }, []);

    const qualityByWC = qualityData.reduce((acc, cur) => {
      const foundWC = acc.find((wc) => wc.wc_id === cur.wc_id);
      if (foundWC) {
        foundWC.good_product_count += Number(cur.good_product_count);
        foundWC.qty += Number(cur.qty);
        return acc;
      } else {
        return [
          ...acc,
          {
            wc_id: cur.wc_id,
            good_product_count: Number(cur.good_product_count),
            qty: Number(cur.qty),
          },
        ];
      }
    }, []);

    const availabilityResult = availabilityByWC.map((data) => ({
      ...data,
      availability:
        Math.round((data.run_hours / data.plan_hours) * 100 * 100) / 100 || 0,
    }));

    const performanceResult = performanceByWC.map((data) => ({
      ...data,
      performance:
        Math.round((data.actual_pcs / data.standard_pcs) * 100 * 100) / 100,
    }));

    const qualityResult = qualityByWC.map((quality) => {
      const defect_count = Number(quality.defect_count);
      const good_product_count = Number(quality.good_product_count);
      const qty = Number(quality.qty);
      const quality_rate =
        Math.round((good_product_count / qty) * 100 * 100) / 100 || 0;
      const defect_rate =
        Math.round((defect_count / good_product_count) * 100 * 100) / 100 || 0;
      return {
        ...quality,
        defect_rate: defect_rate,
        quality_rate: quality_rate,
      };
    });
    const workCenters = await WorkCenterService.findAll(requester_company_id);
    const workCenterOEE = workCenters.map((wc) => {
      const wcAvailability = availabilityResult.find(
        (a) => a.wc_id === wc.wc_id
      );
      const wcPerformance = performanceResult.find((p) => p.wc_id === wc.wc_id);
      const wcQuality = qualityResult.find((q) => q.wc_id === wc.wc_id);
      return {
        wc_id: wc.wc_id,
        a: wcAvailability?.availability.toFixed(2) || 0,
        p: wcPerformance?.performance.toFixed(2) || 0,
        q: wcQuality?.quality_rate.toFixed(2) || 0,
      };
    });
    const result = workCenterOEE
      .filter((oee) => oee.a || oee.p || oee.q)
      .map((oee) => ({
        ...oee,
        oee: ((Number(oee.a) + Number(oee.p) + Number(oee.q)) / 3).toFixed(2),
      }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

const getDailyAvailability = async ({
  dates,
  diffDate,
  wcg_id,
  wc_id,
  company_id,
}) => {
  const dailyAvailabilityWithTarget = await Promise.all(
    dates.map(async (date) => {
      const dailyMachineAvailabilities =
        await dashboardService.getMachineAvailability({
          start: date,
          end: date,
          downtime_id: null,
          wcg_id: wcg_id,
          wc_id: wc_id,
          mch_id: null,
          company_id: company_id,
        });

      const availability = dailyMachineAvailabilities.reduce(
        (acc, machineAvailability) => {
          acc.total_plan_hours +=
            Number(machineAvailability.plan_hours) * diffDate;
          acc.total_run_hours += Number(machineAvailability.run_hours);
          return acc;
        },
        {
          total_plan_hours: 0,
          total_run_hours: 0,
        }
      );
      return {
        total_plan_hours: availability.total_plan_hours,
        total_run_hours: availability.total_run_hours,
        availability:
          Math.round(
            (availability.total_run_hours / availability.total_plan_hours) *
              100 *
              100
          ) / 100 || 0,
        date: date,
      };
    })
  );

  const availabilityDaily = [];
  dailyAvailabilityWithTarget
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    .forEach((dailyAvailableData, idx) => {
      const passDayResult = availabilityDaily[idx - 1];
      if (!passDayResult) {
        availabilityDaily.push({
          target: dailyAvailableData.target,
          total_plan_hours: dailyAvailableData.total_plan_hours,
          total_run_hours: dailyAvailableData.total_run_hours,
          date: dailyAvailableData.date,
          availability:
            Math.round(
              (dailyAvailableData.total_run_hours /
                dailyAvailableData.total_plan_hours) *
                100 *
                100
            ) / 100 || 0,
        });
        return;
      }
      availabilityDaily.push({
        target: dailyAvailableData.target,
        total_plan_hours: dailyAvailableData.total_plan_hours,
        total_run_hours: dailyAvailableData.total_run_hours,
        date: dailyAvailableData.date,
        availability:
          Math.round(
            (dailyAvailableData.total_run_hours /
              dailyAvailableData.total_plan_hours) *
              100 *
              100
          ) / 100 || 0,
      });
    });
  return availabilityDaily;
};

const getDailyPerformance = async ({ dates, wcg_id, wc_id, company_id }) => {
  const dailyPerformanceWithTarget = await Promise.all(
    dates.map(async (date) => {
      const dailyPerformances = await dashboardService.getPerformance({
        start: date,
        end: date,
        company_id,
        wcg_id,
        wc_id,
      });
      const performance = dailyPerformances.reduce(
        (acc, dailyPerformanceData) => {
          acc.hours += Number(dailyPerformanceData.hours);
          acc.standard_pcs += Number(dailyPerformanceData.standard_pcs);
          acc.actual_pcs += Number(dailyPerformanceData.actual_pcs);
          return acc;
        },
        {
          hours: 0,
          standard_pcs: 0,
          actual_pcs: 0,
        }
      );

      return {
        hours: performance.hours,
        standard_pcs: performance.standard_pcs,
        actual_pcs: performance.actual_pcs,
        performance:
          Math.round(
            (performance.actual_pcs / performance.standard_pcs) * 100 * 100
          ) / 100 || 0,
        date: date,
      };
    })
  );

  const result = [];
  dailyPerformanceWithTarget
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    .forEach((dailyPerformance, idx) => {
      const passDayResult = result[idx - 1];
      if (!passDayResult) {
        result.push({
          target: dailyPerformance.target,
          standard_pcs: dailyPerformance.standard_pcs,
          actual_pcs: dailyPerformance.actual_pcs,
          hours: dailyPerformance.hours,
          date: dailyPerformance.date,
          performance:
            Math.round(
              (dailyPerformance.actual_pcs / dailyPerformance.standard_pcs) *
                100 *
                100
            ) / 100 || 0,
        });
        return;
      }
      result.push({
        target: dailyPerformance.target,
        standard_pcs: dailyPerformance.standard_pcs,
        actual_pcs: dailyPerformance.actual_pcs,
        hours: dailyPerformance.hours,
        date: dailyPerformance.date,
        performance:
          Math.round(
            (dailyPerformance.actual_pcs / dailyPerformance.standard_pcs) *
              100 *
              100
          ) / 100 || 0,
      });
    });
  return result;
};

const getDailyQuality = async ({ start, end, company_id, wcg_id, wc_id }) => {
  const qualityData = await dashboardService.getQualityDashboardData({
    start,
    end,
    company_id,
    wcg_id,
    wc_id,
  });
  const dates = getDatesInRange(start, end);

  const result = dates.map((date) => {
    const data = qualityData.find(
      ({ time_card_date }) =>
        dayjs(time_card_date).format("YYYY-MM-DD") === date
    );
    let good_product_count = 0;
    let qty = 0;
    if (data) {
      good_product_count = data.good_product_count;
      qty = data.qty;
    }
    const quality_rate =
      Math.round((good_product_count / qty) * 100 * 100) / 100 || 0;
    return {
      date,
      quality_rate: quality_rate.toFixed(2),
    };
  });
  return result;
};

exports.getOEEDailyData = async (req, res) => {
  try {
    const { start, end, wcg_id, wc_id } = req.query;
    const { requester_company_id } = req;
    let startDate = start;
    if (!startDate) {
      startDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
    }
    let endDate = end;
    if (!end) {
      endDate = dayjs().format("YYYY-MM-DD");
    }
    const dates = getDatesInRange(startDate, endDate);
    const diffDate = dayjs(endDate).diff(dayjs(startDate), "days") || 1;
    const [dailyAvailability, dailyPerformance, dailyQuality] =
      await Promise.all([
        getDailyAvailability({
          dates,
          diffDate,
          wcg_id,
          wc_id,
          company_id: requester_company_id,
        }),
        getDailyPerformance({
          dates,
          diffDate,
          wcg_id,
          wc_id,
          company_id: requester_company_id,
        }),
        getDailyQuality({
          start: startDate,
          end: endDate,
          wcg_id,
          wc_id,
          company_id: requester_company_id,
        }),
      ]);

    const result = dates.map((date) => {
      const dailyA = dailyAvailability.find((a) => a.date === date);
      const dailyP = dailyPerformance.find((p) => p.date === date);
      const dailyQ = dailyQuality.find((q) => q.date === date);
      const aRate = dailyA.availability ? Number(dailyA.availability) : 0;
      const pRate = dailyP.performance ? Number(dailyP.performance) : 0;
      const qRate = dailyQ.quality_rate ? Number(dailyQ.quality_rate) : 0;
      const dailyOEE = (aRate + pRate + qRate) / 3;
      return {
        date,
        oee: dailyOEE.toFixed(2),
      };
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};
