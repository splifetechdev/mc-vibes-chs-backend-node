const { log } = require("make/src/log");
const db = require("../db/models");
const { Op } = require("sequelize");

exports.find_all = async (company_id) =>
  await db.tbl_time_card.findAll({
    where: {
      company_id,
    },
    include: [
      db.tbl_worker,
      db.tbl_mch,
      {
        model: db.tbl_opn_ord,
        // include: { all: true },
      },
      {
        model: db.tbl_time_card_detail,
      },
      { model: db.tbl_mch },
      { model: db.tbl_opn_ord },
      { model: db.doc_running },
    ],
    order: [["created_at", "DESC"]],
  });

exports.remove_log = async (log_id) =>
  await db.tbl_time_card_detail.destroy({
    where: { id: log_id },
  });

exports.remove_defect = async (defect_id) =>
  await db.tbl_time_card_defect.destroy({
    where: {
      id: defect_id,
    },
  });

exports.remove_time_card = async (tc_id) =>
  await db.tbl_time_card.destroy({
    where: {
      id: tc_id,
    },
  });

exports.remove_time_card_detail = async (tc_id) =>
  await db.tbl_time_card_detail.destroy({
    where: {
      time_card_id: tc_id,
    },
  });

exports.bulk_remove_defect = async (defect_id_list) =>
  await db.tbl_time_card_defect.destroy({
    where: {
      id: {
        [Op.in]: defect_id_list,
      },
    },
  });

exports.find_by_id = async (timecard_id, u_define_module_id) =>
  await db.tbl_time_card.findOne({
    where: {
      id: timecard_id,
    },
    include: [
      {
        model: db.u_define_master,
        required: false,
        where: { u_define_module_id },
      },
      { model: db.tbl_mch, required: false },
      { model: db.tbl_opn_ord, required: false },
      { model: db.doc_running, required: false },
    ],
  });

exports.get_time_card_with_log = async (timecard_id) =>
  await db.tbl_time_card.findOne({
    where: {
      id: timecard_id,
    },
    include: [
      {
        model: db.tbl_time_card_detail,
        order: [["tbl_time_card_detail.created_at", "DESC"]],
        include: [db.tbl_time_card_defect],
      },
      {
        model: db.tbl_opn_ord,
      },
      { model: db.tbl_mch },
      { model: db.doc_running },
    ],
  });

exports.post_time_card = async (timeCard) => {
  try {
    return await db.sequelize.transaction(async (t) => {
      const [timecardHeader, timecardDetails] = await Promise.all([
        db.tbl_time_card.findOne({
          where: {
            id: timeCard.id,
          },
          lock: true,
          transaction: t,
        }),
        db.tbl_time_card_detail.findAll({
          where: {
            time_card_id: timeCard.id,
          },
          lock: true,
          transaction: t,
        }),
      ]);
      const opnOrdIdList = timecardDetails.reduce((acc, cur) => {
        if (cur.opn_ord_id) {
          return [...acc, cur.opn_ord_id];
        }
        return acc;
      }, []);
      const opnOrdList = await db.tbl_opn_ord.findAll({
        where: {
          id: {
            [Op.in]: opnOrdIdList,
          },
        },
        lock: true,
        transaction: t,
      });
      await Promise.all(
        timecardDetails.map(async (detail) => {
          if (detail.downtime_id === null && detail.opn_ord_id) {
            let wc_id = detail.wc_id;

            if (!wc_id) {
              const machine = await db.tbl_mch.findOne({
                where: {
                  id: detail.mch_id,
                },
                transaction: t,
              });
              wc_id = machine.work_center_id;
            }
            const opnOrd = opnOrdList.find(
              (opn) => opn.id === detail.opn_ord_id
            );
            const workCenter = await db.tbl_work_center.findOne({
              where: {
                id: wc_id,
              },
              transaction: t,
            });
            const { labor_rate, foh_rate, voh_rate } = workCenter;
            const { work_hours, qty, setup_time } = detail;
            if (qty) {
              opnOrd.receive_qty = Number(qty) + Number(opnOrd.receive_qty);
            }
            if (setup_time) {
              opnOrd.act_setup_time =
                Number(setup_time) + Number(opnOrd.act_setup_time);
            }
            if (work_hours) {
              opnOrd.act_prod_time =
                Number(work_hours) + Number(opnOrd.act_prod_time);
            }
            const labor_cost = labor_rate * work_hours;
            const foh_cost = foh_rate * work_hours;
            const voh_cost = voh_rate * work_hours;
            opnOrd.act_labor_cost = labor_cost + Number(opnOrd.act_labor_cost);
            opnOrd.act_foh_cost = foh_cost + Number(opnOrd.act_foh_cost);
            opnOrd.act_voh_cost = voh_cost + Number(opnOrd.act_voh_cost);
          }
        })
      );
      timecardHeader.status = "post";
      await Promise.all([
        timecardHeader.save({ transaction: t }),
        ...opnOrdList.map((opn) => opn.save({ transaction: t })),
      ]);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * ฟังก์ชันสำหรับ Post Time Card และคำนวณค่าแรงรวมค่า Overtime
 * @param {Object} timeCard - ข้อมูล time card ที่ต้องการ post
 * @param {Object} options - ตัวเลือกสำหรับการทำงาน
 * @param {boolean} options.debug - ถ้าเป็น true จะไม่ commit transaction (เพื่อ debug)
 * @param {boolean} options.dryRun - ถ้าเป็น true จะไม่บันทึกข้อมูลจริง (เพื่อดูผลลัพธ์อย่างเดียว)
 * @returns {Promise} - ผลลัพธ์การดำเนินการ
 */
exports.post_time_card_v2 = async (timeCard, options = {}) => {
  const { debug = false, dryRun = false } = options;
  try {
    console.log("🚀 Starting post_time_card_v2 for timeCard ID:", timeCard.id);
    console.log("🔧 Debug mode:", debug, "| Dry run:", dryRun);

    // เริ่มต้น Database Transaction เพื่อให้ข้อมูลสอดคล้องกัน
    return await db.sequelize.transaction(async (t) => {
      // *** 1. ดึงข้อมูล Time Card Header และ Details ***
      console.log("📋 Fetching timecard header and details...");

      const [timecardHeader, timecardDetails] = await Promise.all([
        // ดึงข้อมูล header ของ time card
        db.tbl_time_card.findOne({
          where: {
            id: timeCard.id,
          },
          lock: true, // ล็อคข้อมูลเพื่อป้องกันการแก้ไขพร้อมกัน
          transaction: t,
        }),
        // ดึงข้อมูล details ทั้งหมดของ time card นี้
        db.tbl_time_card_detail.findAll({
          where: {
            time_card_id: timeCard.id,
          },
          lock: true,
          transaction: t,
        }),
      ]);

      console.log(
        "📄 Timecard Header:",
        JSON.stringify(timecardHeader, null, 2)
      );
      console.log("📝 Timecard Details count:", timecardDetails.length);
      console.log(
        "📝 Timecard Details:",
        JSON.stringify(timecardDetails, null, 2)
      );

      // *** 2. รวบรวม Operation Order IDs ***
      // สร้างลิสต์ของ opn_ord_id ที่ไม่ใช่ null
      const opnOrdIdList = timecardDetails.reduce((acc, cur) => {
        if (cur.opn_ord_id) {
          return [...acc, cur.opn_ord_id];
        }
        return acc;
      }, []);

      console.log("🔢 Operation Order IDs:", opnOrdIdList);

      // *** 3. ดึงข้อมูล Operation Orders ***
      // ดึงข้อมูล operation orders ทั้งหมดที่เกี่ยวข้อง
      const opnOrdList = await db.tbl_opn_ord.findAll({
        where: {
          id: {
            [Op.in]: opnOrdIdList,
          },
        },
        lock: true,
        transaction: t,
      });

      console.log("📦 Operation Orders loaded:", opnOrdList.length);
      opnOrdList.forEach((opn, index) => {
        console.log(
          `📦 OpnOrd[${index}] ID:${opn.id}, receive_qty:${opn.receive_qty}, act_labor_cost:${opn.act_labor_cost}`
        );
      });

      // *** 4. ฟังก์ชันคำนวณเวลาที่ซ้อนทับกัน ***
      /**
       * คำนวณชั่วโมงที่ซ้อนทับระหว่างสองช่วงเวลา
       * @param {string} start1 - เวลาเริ่มต้นช่วงแรก (HH:MM:SS)
       * @param {string} end1 - เวลาสิ้นสุดช่วงแรก (HH:MM:SS)
       * @param {string} start2 - เวลาเริ่มต้นช่วงที่สอง (HH:MM:SS)
       * @param {string} end2 - เวลาสิ้นสุดช่วงที่สอง (HH:MM:SS)
       * @returns {number} - จำนวนชั่วโมงที่ซ้อนทับ
       */
      const calculateOverlapHours = (start1, end1, start2, end2) => {
        console.log(
          `🕐 Calculating overlap between ${start1}-${end1} and ${start2}-${end2}`
        );

        // แปลงเวลาจากรูปแบบ "HH:MM:SS" เป็นนาที
        const timeToMinutes = (timeStr) => {
          const [hours, minutes, seconds] = timeStr.split(":").map(Number);
          return hours * 60 + minutes + (seconds || 0) / 60;
        };

        // แปลงเวลาทั้งหมดเป็นนาที
        const start1Min = timeToMinutes(start1);
        const end1Min = timeToMinutes(end1);
        const start2Min = timeToMinutes(start2);
        const end2Min = timeToMinutes(end2);

        console.log(
          `🕐 Converted to minutes: Work(${start1Min}-${end1Min}), OT(${start2Min}-${end2Min})`
        );

        // หาจุดเริ่มต้นและสิ้นสุดของช่วงที่ซ้อนทับ
        const overlapStart = Math.max(start1Min, start2Min); // เริ่มต้นช้ากว่า
        const overlapEnd = Math.min(end1Min, end2Min); // สิ้นสุดเร็วกว่า

        // ถ้ามีการซ้อนทับ คำนวณและแปลงเป็นชั่วโมง
        if (overlapStart < overlapEnd) {
          const overlapHours = (overlapEnd - overlapStart) / 60;
          console.log(
            `🕐 Overlap found: ${overlapHours} hours (${overlapStart}-${overlapEnd} minutes)`
          );
          return overlapHours; // แปลงนาทีเป็นชั่วโมง
        }

        console.log("🕐 No overlap found");
        return 0; // ไม่มีการซ้อนทับ
      };

      // *** 5. ประมวลผล Time Card Details แต่ละรายการ ***
      await Promise.all(
        timecardDetails.map(async (detail, detailIndex) => {
          console.log(
            `\n⚙️ Processing detail ${detailIndex + 1}/${
              timecardDetails.length
            }`
          );
          console.log(
            `⚙️ Detail ID: ${detail.id}, downtime_id: ${detail.downtime_id}, opn_ord_id: ${detail.opn_ord_id}`
          );

          // ประมวลผลเฉพาะรายการที่ไม่ใช่ downtime และมี operation order
          if (detail.downtime_id === null && detail.opn_ord_id) {
            console.log("✅ Processing production detail (not downtime)");

            // *** 5.1 หา Work Center ID ***
            let wc_id = detail.wc_id;
            console.log(`🏭 Initial wc_id: ${wc_id}, mch_id: ${detail.mch_id}`);

            // ถ้าไม่มี work center id ให้หาจาก machine
            if (!wc_id) {
              const machine = await db.tbl_mch.findOne({
                where: {
                  id: detail.mch_id,
                },
                transaction: t,
              });
              wc_id = machine?.work_center_id;
              console.log(`🏭 Loaded wc_id from machine: ${wc_id}`);
            }

            // *** 5.2 ดึงข้อมูล Operation Order และ Work Center ***
            const opnOrd = opnOrdList.find(
              (opn) => opn.id === detail.opn_ord_id
            );

            const workCenter = await db.tbl_work_center.findOne({
              where: {
                id: wc_id,
              },
              transaction: t,
            });

            console.log(`📋 Operation Order ID: ${opnOrd?.id}`);
            console.log(
              `🏭 Work Center: ${workCenter?.wc_name}, labor_rate: ${workCenter?.labor_rate}`
            );

            // *** 5.3 ดึงข้อมูลค่าใช้จ่ายและเวลาทำงาน ***
            let { labor_rate, foh_rate, voh_rate } = workCenter;
            const { work_hours, qty, setup_time, time_start, time_end } =
              detail;

            console.log(
              `💰 Initial rates - labor: ${labor_rate}, foh: ${foh_rate}, voh: ${voh_rate}`
            );
            console.log(
              `⏱️ Work details - hours: ${work_hours}, qty: ${qty}, setup: ${setup_time}`
            );
            console.log(`⏰ Time range: ${time_start} - ${time_end}`);

            // ✅ แก้ไข: ดึง labor_rate จาก worker แต่ไม่ reset เป็น 0
            const get_labar_rate = await db.tbl_worker.findOne({
              where: { id: detail.worker_id },
              transaction: t,
            });

            console.log(
              "👷 Worker details:",
              JSON.stringify(get_labar_rate, null, 2)
            );

            if (get_labar_rate && get_labar_rate.emp_rate) {
              labor_rate = get_labar_rate.emp_rate;
              console.log("👷 Loaded worker labor rate:", labor_rate);
            } else {
              console.warn(
                "⚠️ No labor rate found for worker ID:",
                detail.worker_id,
                "- using work center rate:",
                labor_rate
              );
              // ใช้ labor_rate จาก work center ที่ได้มาตั้งแต่ต้น
            }

            // *** 5.4 อัพเดท Quantity และ Time ***
            console.log("📊 Updating quantities and times...");

            // เพิ่มจำนวนที่ผลิตได้ (เฉพาะเมื่อ qty > 0)
            if (qty && qty > 0) {
              const oldReceiveQty = opnOrd.receive_qty;
              opnOrd.receive_qty = Number(qty) + Number(opnOrd.receive_qty);
              console.log(
                `📊 Updated receive_qty: ${oldReceiveQty} + ${qty} = ${opnOrd.receive_qty}`
              );
            } else {
              console.log(`📊 Skipping qty update (qty = ${qty})`);
            }

            // เพิ่มเวลา setup (เฉพาะเมื่อ setup_time > 0)
            if (setup_time && setup_time > 0) {
              const oldSetupTime = opnOrd.act_setup_time;
              opnOrd.act_setup_time =
                Number(setup_time) + Number(opnOrd.act_setup_time);
              console.log(
                `📊 Updated setup_time: ${oldSetupTime} + ${setup_time} = ${opnOrd.act_setup_time}`
              );
            } else {
              console.log(
                `📊 Skipping setup_time update (setup_time = ${setup_time})`
              );
            }

            // เพิ่มเวลาผลิต (เฉพาะเมื่อ work_hours > 0)
            if (work_hours && work_hours > 0) {
              const oldProdTime = opnOrd.act_prod_time;
              opnOrd.act_prod_time =
                Number(work_hours) + Number(opnOrd.act_prod_time);
              console.log(
                `📊 Updated prod_time: ${oldProdTime} + ${work_hours} = ${opnOrd.act_prod_time}`
              );
            } else {
              console.log(
                `📊 Skipping prod_time update (work_hours = ${work_hours})`
              );
            }

            // *** 5.5 คำนวณค่าแรงปกติ (เริ่มต้น) ***
            let regular_work_hours = work_hours || 0; // เวลาทำงานปกติ (จะถูกลดลงถ้ามี OT)
            let total_ot_hours = 0; // รวมชั่วโมง OT
            let total_ot_cost = 0; // รวมค่าแรง OT

            console.log(
              `💰 Initial calculation - work_hours: ${work_hours}, labor_rate: ${labor_rate}`
            );

            // *** 5.6 ตรวจสอบและคำนวณค่าแรง Overtime ***
            if (detail.mch_id && time_start && time_end) {
              console.log("🕐 Starting OT calculation...");

              try {
                // Query หาข้อมูล OT ของเครื่องจักร
                const otQuery = `
                  SELECT 
                    sot.ot_start_time,  -- เวลาเริ่มต้น OT
                    sot.ot_end_time,    -- เวลาสิ้นสุด OT
                    sot.ot_rate         -- อัตราค่าแรง OT
                  FROM tbl_mch_shift ms
                  LEFT JOIN tbl_shift s ON ms.shift_id = s.id
                  LEFT JOIN tbl_shift_ot sot ON s.id = sot.shift_id
                  WHERE ms.machine_id = :machine_id
                    AND sot.ot_start_time IS NOT NULL
                    AND sot.ot_end_time IS NOT NULL
                `;

                console.log(
                  `🔍 Querying OT data for machine_id: ${detail.mch_id}`
                );

                // Execute query โดยใส่ machine_id
                const otResults = await db.sequelize.query(otQuery, {
                  replacements: { machine_id: detail.mch_id },
                  type: db.sequelize.QueryTypes.SELECT,
                  transaction: t,
                });

                console.log(
                  `🔍 Found ${otResults?.length || 0} OT periods:`,
                  JSON.stringify(otResults, null, 2)
                );

                // *** 5.7 คำนวณค่าแรง OT ถ้าพบข้อมูล ***
                if (otResults && otResults.length > 0) {
                  // วนลูปทุกช่วง OT ที่พบ (อาจมีหลายช่วงเวลา)
                  otResults.forEach((otData, otIndex) => {
                    const { ot_start_time, ot_end_time, ot_rate } = otData;

                    // แปลง Date object เป็น string รูปแบบ HH:MM:SS
                    const formatTimeFromDate = (dateObj) => {
                      if (!dateObj) return null;

                      // ถ้าเป็น string อยู่แล้ว ให้ return ตรงๆ
                      if (typeof dateObj === "string") {
                        return dateObj;
                      }

                      // ถ้าเป็น Date object ให้แปลงเป็น HH:MM:SS โดยใช้ UTC
                      if (dateObj instanceof Date) {
                        const hours = dateObj
                          .getUTCHours()
                          .toString()
                          .padStart(2, "0");
                        const minutes = dateObj
                          .getUTCMinutes()
                          .toString()
                          .padStart(2, "0");
                        const seconds = dateObj
                          .getUTCSeconds()
                          .toString()
                          .padStart(2, "0");
                        return `${hours}:${minutes}:${seconds}`;
                      }

                      return null;
                    };

                    const otStartFormatted = formatTimeFromDate(ot_start_time);
                    const otEndFormatted = formatTimeFromDate(ot_end_time);

                    console.log(`\n🕐 Processing OT period ${otIndex + 1}:`);
                    console.log(
                      `   - Original: ${ot_start_time} - ${ot_end_time}`
                    );
                    console.log(
                      `   - Formatted: ${otStartFormatted} - ${otEndFormatted}`
                    );
                    console.log(`   - Rate: ${ot_rate}`);

                    // ตรวจสอบว่าข้อมูลถูกต้องก่อนคำนวณ
                    if (!otStartFormatted || !otEndFormatted) {
                      console.warn(
                        `⚠️ Invalid OT time format, skipping period ${
                          otIndex + 1
                        }`
                      );
                      return;
                    }

                    // คำนวณชั่วโมง OT ที่ซ้อนทับกับเวลาทำงานจริง
                    const otHours = calculateOverlapHours(
                      time_start, // เวลาเริ่มทำงานจาก time card
                      time_end, // เวลาเลิกทำงานจาก time card
                      otStartFormatted, // เวลาเริ่มต้น OT (แปลงแล้ว)
                      otEndFormatted // เวลาสิ้นสุด OT (แปลงแล้ว)
                    );

                    // ถ้ามีชั่วโมง OT ให้คำนวณค่าแรง OT
                    if (otHours > 0) {
                      const ot_labor_cost = labor_rate * ot_rate * otHours;
                      total_ot_cost += ot_labor_cost;
                      total_ot_hours += otHours;

                      console.log(`💰 OT Calculation:`);
                      console.log(`   - Labor Rate: ${labor_rate}`);
                      console.log(`   - OT Rate Multiplier: ${ot_rate}`);
                      console.log(`   - OT Hours: ${otHours}`);
                      console.log(
                        `   - OT Cost: (${labor_rate} × ${ot_rate}) × ${otHours} = ${ot_labor_cost}`
                      );
                      console.log(
                        `   - Total OT Hours so far: ${total_ot_hours}`
                      );
                      console.log(
                        `   - Total OT Cost so far: ${total_ot_cost}`
                      );
                    }
                  });

                  // *** 5.8 ปรับปรุงเวลาทำงานปกติ (ตัดเวลา OT ออก) ***
                  if (total_ot_hours > 0) {
                    regular_work_hours = Math.max(
                      0,
                      (work_hours || 0) - total_ot_hours
                    );
                    console.log(
                      `⚖️ Adjusted regular work hours: ${work_hours} - ${total_ot_hours} = ${regular_work_hours}`
                    );
                  }
                }
              } catch (error) {
                console.error("❌ Error calculating OT:", error);
                // ถ้าเกิดข้อผิดพลาดในการคำนวณ OT ให้ใช้ค่าแรงปกติ
                // (ไม่ให้ระบบหยุดทำงาน)
              }
            } else {
              console.log(
                "ℹ️ Skipping OT calculation - missing machine_id or time range"
              );
            }

            // *** 5.9 คำนวณค่าแรงสุดท้าย ***
            const regular_labor_cost = labor_rate * regular_work_hours; // ค่าแรงปกติ (หลังตัด OT)
            const total_labor_cost = regular_labor_cost + total_ot_cost; // ค่าแรงรวม
            const foh_cost = foh_rate * (work_hours || 0); // Fixed Overhead Cost (ใช้เวลาทั้งหมด)
            const voh_cost = voh_rate * (work_hours || 0); // Variable Overhead Cost (ใช้เวลาทั้งหมด)

            console.log(`💰 Final cost calculation:`);
            console.log(`   - Regular work hours: ${regular_work_hours}`);
            console.log(
              `   - Regular labor cost: ${labor_rate} × ${regular_work_hours} = ${regular_labor_cost}`
            );
            console.log(`   - OT work hours: ${total_ot_hours}`);
            console.log(`   - OT labor cost: ${total_ot_cost}`);
            console.log(
              `   - Total labor cost: ${regular_labor_cost} + ${total_ot_cost} = ${total_labor_cost}`
            );
            console.log(
              `   - FOH cost: ${foh_rate} × ${work_hours || 0} = ${foh_cost}`
            );
            console.log(
              `   - VOH cost: ${voh_rate} × ${work_hours || 0} = ${voh_cost}`
            );

            // *** 5.10 อัพเดทค่าใช้จ่ายใน Operation Order ***
            const oldLaborCost = opnOrd.act_labor_cost;
            const oldFohCost = opnOrd.act_foh_cost;
            const oldVohCost = opnOrd.act_voh_cost;

            opnOrd.act_labor_cost =
              total_labor_cost + Number(opnOrd.act_labor_cost);
            opnOrd.act_foh_cost = foh_cost + Number(opnOrd.act_foh_cost);
            opnOrd.act_voh_cost = voh_cost + Number(opnOrd.act_voh_cost);

            console.log(`📊 Updated operation costs:`);
            console.log(
              `   - Labor: ${oldLaborCost} + ${total_labor_cost} = ${opnOrd.act_labor_cost}`
            );
            console.log(
              `   - FOH: ${oldFohCost} + ${foh_cost} = ${opnOrd.act_foh_cost}`
            );
            console.log(
              `   - VOH: ${oldVohCost} + ${voh_cost} = ${opnOrd.act_voh_cost}`
            );
          } else {
            console.log("⏭️ Skipping detail (downtime or no operation order)");
          }
        })
      );

      // *** 6. บันทึกการเปลี่ยนแปลงทั้งหมด ***
      console.log("💾 Saving all changes...");

      // เปลี่ยนสถานะ time card เป็น "post"
      const oldStatus = timecardHeader.status;
      timecardHeader.status = "post";
      console.log(`📋 Updating timecard status: ${oldStatus} → post`);

      // ตรวจสอบโหมด debug หรือ dry run
      if (debug) {
        console.log(
          "🚨 DEBUG MODE: Rolling back transaction to prevent data changes"
        );
        console.log("📋 Changes that WOULD be saved:");
        console.log(`   - Timecard status: ${oldStatus} → post`);
        opnOrdList.forEach((opn, index) => {
          console.log(`   - OpnOrd[${index + 1}] ID:${opn.id}:`);
          console.log(`     * Labor cost: ${opn.act_labor_cost}`);
          console.log(`     * FOH cost: ${opn.act_foh_cost}`);
          console.log(`     * VOH cost: ${opn.act_voh_cost}`);
          console.log(`     * Receive qty: ${opn.receive_qty}`);
          console.log(`     * Setup time: ${opn.act_setup_time}`);
          console.log(`     * Prod time: ${opn.act_prod_time}`);
        });

        // บังคับ rollback transaction
        throw new Error("DEBUG_MODE_ROLLBACK");
      } else if (dryRun) {
        console.log("🧪 DRY RUN MODE: Showing results without saving");
        console.log("📋 Changes that WOULD be saved:");
        console.log(`   - Timecard status: ${oldStatus} → post`);
        opnOrdList.forEach((opn, index) => {
          console.log(`   - OpnOrd[${index + 1}] ID:${opn.id}:`);
          console.log(`     * Labor cost: ${opn.act_labor_cost}`);
          console.log(`     * FOH cost: ${opn.act_foh_cost}`);
          console.log(`     * VOH cost: ${opn.act_voh_cost}`);
          console.log(`     * Receive qty: ${opn.receive_qty}`);
          console.log(`     * Setup time: ${opn.act_setup_time}`);
          console.log(`     * Prod time: ${opn.act_prod_time}`);
        });

        return {
          success: true,
          mode: "DRY_RUN",
          message: "Calculation completed without saving data",
          timecardId: timeCard.id,
          changes: {
            timecardStatus: { from: oldStatus, to: "post" },
            operationOrders: opnOrdList.map((opn) => ({
              id: opn.id,
              laborCost: opn.act_labor_cost,
              fohCost: opn.act_foh_cost,
              vohCost: opn.act_voh_cost,
              receiveQty: opn.receive_qty,
              setupTime: opn.act_setup_time,
              prodTime: opn.act_prod_time,
            })),
          },
        };
      } else {
        // บันทึกข้อมูลจริง
        await Promise.all([
          timecardHeader.save({ transaction: t }), // บันทึก time card header
          ...opnOrdList.map((opn) => opn.save({ transaction: t })), // บันทึก operation orders ทั้งหมด
        ]);

        console.log("✅ Post timecard completed successfully!");
      }

      // สรุปผลลัพธ์
      console.log("\n📋 SUMMARY:");
      console.log(`   - Timecard ID: ${timeCard.id}`);
      console.log(`   - Status: ${oldStatus} → post`);
      console.log(`   - Details processed: ${timecardDetails.length}`);
      console.log(`   - Operation orders updated: ${opnOrdList.length}`);

      opnOrdList.forEach((opn, index) => {
        console.log(
          `   - OpnOrd[${index + 1}] ID:${opn.id} - Labor: ${
            opn.act_labor_cost
          }, FOH: ${opn.act_foh_cost}, VOH: ${opn.act_voh_cost}`
        );
      });
    });
  } catch (error) {
    // ตรวจสอบว่าเป็น debug mode rollback หรือไม่
    if (error.message === "DEBUG_MODE_ROLLBACK") {
      console.log("🔄 Transaction rolled back successfully (Debug mode)");
      return {
        success: true,
        mode: "DEBUG",
        message: "Debug completed - no data was changed",
        timecardId: timeCard.id,
      };
    }

    console.error("❌ Error in post_time_card_v2:", error);
    throw error;
  }
};

exports.save_log = async (time_card_log) => {
  try {
    console.log(
      "Saving tbl_time_card_detail log create:",
      JSON.stringify(time_card_log, null, 2)
    );

    return await db.tbl_time_card_detail.create(time_card_log);
    return await db.sequelize.transaction(async (t) => {
      const [workCenter, opnOrd] = await Promise.all([
        db.tbl_work_center.findOne({
          where: {
            id: time_card_log.wc_id,
          },
          transaction: t,
        }),
        db.tbl_opn_ord.findOne({
          where: {
            id: time_card_log.opn_ord_id,
          },
          lock: true,
          transaction: t,
        }),
      ]);
      const { labor_rate, foh_rate, voh_rate } = workCenter;
      const { work_hours, qty, setup_time } = time_card_log;
      const savedData = await db.tbl_time_card_detail.create(time_card_log, {
        transaction: t,
      });
      if (
        !time_card_log.downtime_id &&
        !time_card_log.tbl_time_card_defects.length
      ) {
        if (qty) {
          opnOrd.receive_qty = Number(qty) + Number(opnOrd.receive_qty);
        }
        if (setup_time) {
          opnOrd.act_setup_time =
            Number(setup_time) + Number(opnOrd.setup_time);
        }
        if (work_hours) {
          opnOrd.act_prod_time =
            Number(work_hours) + Number(opnOrd.act_prod_time);
        }

        const labor_cost = labor_rate * work_hours;
        const foh_cost = foh_rate * work_hours;
        const voh_cost = voh_rate * work_hours;
        opnOrd.act_labor_cost = labor_cost + Number(opnOrd.act_labor_cost);
        opnOrd.act_foh_cost = foh_cost + Number(opnOrd.act_foh_cost);
        opnOrd.act_voh_cost = voh_cost + Number(opnOrd.act_voh_cost);
        await opnOrd.save({ transaction: t });
      }

      return savedData;
    });
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

exports.update_log = async (time_card_log) => {
  try {
    console.log(
      "Saving tbl_time_card_detail log update:",
      JSON.stringify(time_card_log, null, 2)
    );

    return db.tbl_time_card_detail.update(time_card_log, {
      where: {
        id: time_card_log.id,
      },
    });
    return await db.sequelize.transaction(async (t) => {
      const [workCenter, opnOrd, timeCardLog] = await Promise.all([
        db.tbl_work_center.findOne({
          where: {
            id: time_card_log.wc_id,
          },
          transaction: t,
        }),
        db.tbl_opn_ord.findOne({
          where: {
            id: time_card_log.opn_ord_id,
          },
          lock: true,
          transaction: t,
        }),
        db.tbl_time_card_detail.findOne({
          where: {
            id: time_card_log.id,
          },
          transaction: t,
        }),
      ]);
      const { labor_rate, foh_rate, voh_rate } = workCenter;
      const { work_hours, qty, setup_time } = time_card_log;
      const savedData = db.tbl_time_card_detail.update(time_card_log, {
        where: {
          id: time_card_log.id,
        },
        transaction: t,
      });
      if (
        !time_card_log.downtime_id &&
        !time_card_log.tbl_time_card_defects.length
      ) {
        if (qty) {
          const diff = Number(qty) - Number(timeCardLog.qty);
          opnOrd.receive_qty = diff + Number(opnOrd.receive_qty);
        }
        if (setup_time) {
          const diff = Number(setup_time) - Number(timeCardLog.setup_time);
          opnOrd.act_setup_time = diff + Number(opnOrd.act_setup_time);
        }

        if (work_hours) {
          const diff = Number(work_hours) - Number(timeCardLog.work_hours);
          opnOrd.act_prod_time = diff + Number(opnOrd.act_prod_time);
        }
        const old_labor_cost = labor_rate * Number(timeCardLog.work_hours);
        const labor_cost = labor_rate * work_hours;
        const labor_diff = labor_cost - old_labor_cost;

        const old_foh_cost = foh_rate * Number(timeCardLog.work_hours);
        const foh_cost = foh_rate * work_hours;
        const foh_diff = foh_cost - old_foh_cost;

        const old_voh_cost = voh_rate * Number(timeCardLog.work_hours);
        const voh_cost = voh_rate * work_hours;
        const voh_diff = voh_cost - old_voh_cost;
        opnOrd.act_labor_cost = labor_diff + Number(opnOrd.act_labor_cost);
        opnOrd.act_foh_cost = foh_diff + Number(opnOrd.act_foh_cost);
        opnOrd.act_voh_cost = voh_diff + Number(opnOrd.act_voh_cost);
        await opnOrd.save({ transaction: t });
      }
      return await savedData;
    });
  } catch (error) {
    console.log({ error });
    throw error;
  }
};

exports.save_defect = async (defect) =>
  await db.tbl_time_card_defect.create(defect);

exports.update_defect = async (defect) =>
  await db.tbl_time_card_defect.update(defect, {
    where: {
      id: defect.id,
    },
  });

exports.list_work_order_option = async (company_id) => {
  const queryResult = await db.sequelize.query(
    `SELECT DISTINCT doc_running_no from tbl_opn_ord where company_id = ${company_id}`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return queryResult;
};

// exports.find_machine_by_id = async (machine_id) => await db.tbl_mch.findOne({
//   where: {
//     id: machine_id
//   },
//   include: [db.tbl_work_center]
// })

// exports.find_by_id_getname = async (id) => await db.tbl_mch.findOne({
//   where: {
//     id: id
//   },
// })

// exports.find_by_company_id_and_machine_id = async (company_id, machine_id) => await db.tbl_mch.findOne({
//   where: {
//     company_id,
//     machine_id
//   }
// })

exports.create = async (data) => {
  console.log("Creating time card with data:", JSON.stringify(data, null, 2));
  return await db.tbl_time_card.create(data);
};

// exports.update = async (id, data) =>
//   await db.tbl_mch.update(data, {
//     where: {
//       id: id,
//     },
//   });

// exports.delete = async (id) =>
//   await db.tbl_mch.destroy({
//     where: {
//       id: id,
//     },
//   });

exports.getdeletejobbycompany = async (data) =>
  await db.tbl_time_card.findAll({
    attributes: {
      include: [
        [
          db.sequelize.fn("FORMAT", db.sequelize.col("doc_date"), "dd/MM/yyyy"),
          "doc_date_show",
        ],
      ],
    },
    where: {
      company_id: data.company_id,
      [Op.and]: [
        data.wo_running_no && { wo_running_no: data.wo_running_no },
        data.mch_id && { mch_id: data.mch_id },
        data.doc_date && {
          doc_date: {
            [Op.between]: [data.datefrom, data.dateto],
          },
        },
        data.doc_running_no && { doc_running_no: data.doc_running_no },
      ],
    },
    include: [
      { model: db.tbl_mch },
      {
        model: db.tbl_time_card_detail,
      },
    ],
  });

exports.list_doc_running_no_option = async (company_id) => {
  const queryResult = await db.sequelize.query(
    `SELECT DISTINCT doc_running_no from tbl_time_card where company_id = ${company_id}`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return queryResult;
};

exports.listtimecardWorkOrderOptions = async (company_id) => {
  const queryResult = await db.sequelize.query(
    `SELECT DISTINCT wo_running_no from tbl_time_card where company_id = ${company_id}`,
    { type: db.sequelize.QueryTypes.SELECT }
  );
  return queryResult;
};
