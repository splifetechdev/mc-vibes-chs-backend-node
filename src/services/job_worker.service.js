const jobWorkerRepository = require('../repositories/job_worker.repository')

exports.create = async (data) => await jobWorkerRepository.create(data)

exports.remove = async (job_id, job_worker_id) => await jobWorkerRepository.delete(job_id, job_worker_id)