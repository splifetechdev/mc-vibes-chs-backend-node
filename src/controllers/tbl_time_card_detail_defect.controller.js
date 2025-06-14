const db = require("../db/models");

exports.upsert = async (req, res) => {
  try {
    const { time_card_detail_id, defects } = req.body;
    if (!time_card_detail_id) {
      return res.status(400).send({ error: "time_card_detail_id is required" });
    }
    if (!defects) {
      return res.status(400).send({ error: "defects is required" });
    }

    const existingDefects = await db.tbl_time_card_defect.findAll({
      where: {
        time_card_log_id: time_card_detail_id,
      },
    });
    const deleteItems = existingDefects.filter((existingDefect) =>
      defects.every(
        (defect) => defect.defect_cause_id !== existingDefect.defect_cause_id
      )
    );
    const createItems = defects.filter((defect) =>
      existingDefects.every(
        (existingDefect) =>
          defect.defect_cause_id !== existingDefect.defect_cause_id
      )
    );
    const updateItems = defects.filter(
      (defect) =>
        deleteItems.every(
          (existingDefect) =>
            defect.defect_cause_id !== existingDefect.defect_cause_id
        ) &&
        createItems.every(
          (newDefect) => newDefect.defect_cause_id !== defect.defect_cause_id
        )
    );
    await Promise.all([
      ...deleteItems.map((deleteItem) =>
        db.tbl_time_card_defect.destroy({
          where: {
            id: deleteItem.id,
          },
        })
      ),
      ...createItems.map((createItem) =>
        db.tbl_time_card_defect.create({
          defect_cause_id: createItem.defect_cause_id,
          qty: createItem.qty,
          time_card_log_id: time_card_detail_id,
          created_by: req.requester_id,
        })
      ),
      ...updateItems.map((updateItem) =>
        db.tbl_time_card_defect.update(
          { qty: updateItem.qty },
          {
            where: {
              time_card_log_id: time_card_detail_id,
              defect_cause_id: updateItem.defect_cause_id,
            },
          }
        )
      ),
    ]);
    res.json({ message: "Success" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
