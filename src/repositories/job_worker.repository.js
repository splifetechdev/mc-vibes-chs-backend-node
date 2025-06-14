const db = require("../db/models");

exports.create = async (data) =>
  await db.tbl_job_worker.create(data)

exports.delete = async (job_id, job_worker_id) =>
  await db.tbl_job_worker.destroy({
    where: {
      job_id,
      worker_id: job_worker_id
    }
  })