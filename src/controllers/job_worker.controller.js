const jobWorkerService = require('../services/job_worker.service')

exports.createJobWorker = async (req, res) => {
  try {
    const { body: data, params } = req
    const { job_id } = params
    const result = await jobWorkerService.create({ ...data, job_id })
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: error.message })
  }
}

exports.removeJobWorker = async (req, res) => {
  try {
    const { job_id, job_worker_id } = req.params
    const result = await jobWorkerService.remove(job_id, job_worker_id)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: error.message })
  }
}