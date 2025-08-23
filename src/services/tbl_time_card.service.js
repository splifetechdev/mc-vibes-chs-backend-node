const tbl_time_card_repo = require("../repositories/tbl_time_card.repository");
const production_order_draft = require("../repositories/production_order_draft.repository");
// exports.find_all = async (company_id) => await tbl_time_card_repo.find_all(company_id);

// // exports.findAllByID = async (id, u_define_id) =>
// //   await tbl_time_card_repo.findtbl_shiftAllByID(id, u_define_id);
exports.find_by_id = async (id, u_define_module_id) =>
  await tbl_time_card_repo.find_by_id(id, u_define_module_id);

exports.list_log = async (tc_id) => {
  return await tbl_time_card_repo.get_time_card_with_log(tc_id);
};

exports.remove_log = async (log_id) => {
  return await tbl_time_card_repo.remove_log(log_id);
};

exports.save_log = async (time_card_log) =>
  await tbl_time_card_repo.save_log(time_card_log);

exports.update_log = async (time_card_log) =>
  await tbl_time_card_repo.update_log(time_card_log);

exports.save_defect = async (defect) =>
  await tbl_time_card_repo.save_defect(defect);

exports.upsert_defect = async (log_id, defect, requester_id) => {
  if (defect.id) {
    tbl_time_card_repo.update_defect({
      ...defect,
      created_by: requester_id,
      updated_by: requester_id,
    });
  } else {
    tbl_time_card_repo.save_defect({
      ...defect,
      time_card_log_id: log_id,
      created_by: requester_id,
      updated_by: requester_id,
    });
  }
};

exports.post_time_card = async (timeCard) =>
  await tbl_time_card_repo.post_time_card(timeCard);

exports.post_time_card_v2 = async (timeCard) =>
  await tbl_time_card_repo.post_time_card_v2(timeCard, {
    debug: false,
    dryRun: false,
  });

exports.remove_time_card = async (tc_id) =>
  tbl_time_card_repo.remove_time_card(tc_id);

exports.remove_time_card_detail = async (tc_id) =>
  tbl_time_card_repo.remove_time_card_detail(tc_id);

exports.bulk_remove_defect = async (defect_id_list) =>
  tbl_time_card_repo.bulk_remove_defect(defect_id_list);

exports.update_defect = async (defect) =>
  await tbl_time_card_repo.update_defect(defect);

exports.list_work_order_option = async (company_id) => {
  const result = await tbl_time_card_repo.list_work_order_option(company_id);
  return result;
};

exports.remove_defect = async (defect_id) =>
  await tbl_time_card_repo.remove_defect(defect_id);

exports.list_opn_ord = async (company_id) =>
  await production_order_draft.findApproveProdOrderOptionList(company_id);

// exports.find_by_id_getname = async (id) => {
//   return await tbl_time_card_repo.find_by_id_getname(id);
// }
exports.get_ord_by_id = async (ord_id) =>
  await production_order_draft.get_ord_by_id(ord_id);
// exports.find_machine_by_id = async (mch_id) => {
//   return await tbl_time_card_repo.find_machine_by_id(mch_id)
// }

exports.list = async (company_id) =>
  await tbl_time_card_repo.find_all(company_id);

exports.create = async (data) => {
  // const machine = await tbl_time_card_repo.find_by_company_id_and_tim(data.company_id, data.machine_id)
  // if (machine) {
  //   throw new Error(`Existing machine:${data.machine_id} company:${data.company_id}`)
  // }
  return await tbl_time_card_repo.create(data);
};

// exports.update = async (id, data) => await tbl_mch_repository.update(id, data);

// exports.delete = async (id) => await tbl_mch_repository.delete(id);

exports.getdeletejobbycompany = async (data) =>
  await tbl_time_card_repo.getdeletejobbycompany(data);

exports.list_doc_running_no_option = async (company_id) =>
  await tbl_time_card_repo.list_doc_running_no_option(company_id);

exports.listtimecardWorkOrderOptions = async (company_id) => {
  const result = await tbl_time_card_repo.listtimecardWorkOrderOptions(
    company_id
  );
  return result;
};

exports.time_card_detail_check_opn_id_ues = async (opn_id) => {
  return await tbl_time_card_repo.time_card_detail_check_opn_id_ues(opn_id);
};
