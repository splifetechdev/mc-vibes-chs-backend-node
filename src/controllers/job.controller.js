const jobService = require('../services/job.service')

exports.listJob = async (req, res) => {
  try {
    const { requester_company_id } = req
    const status = req.query.status || "pending"
    const availableStatuses = ["pending", "start", "end"]
    if (!availableStatuses.includes(status.toLowerCase())) {
      return res.status(400).send({ error: `invalid status ${status}` })
    }
    if (status.toLowerCase() === 'pending') {
      const result = await jobService.listPendingJob(requester_company_id)
      return res.json(result)
    } else if (status.toLowerCase() === 'start') {
      const result = await jobService.listStartingJob(requester_company_id)
      return res.json(result)
    } else {
      const result = await jobService.listEndJob(requester_company_id)
      return res.json(result)
    }

  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
}

exports.createJob = async (req, res) => {
  try {
    const { requester_id, body: data } = req
    const result = await jobService.createJob({
      ...data,
      created_by: requester_id,
      updated_by: requester_id
    })
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
}

exports.updateJob = async (req, res) => {
  try {
    const { requester_id, body: data } = req
    const result = await jobService.updateJob({
      ...data,
      updated_by: requester_id
    })
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).send(error)
  }
}

exports.getLatestJobByRequester = async (req, res) => {
  try {
    const { requester_id } = req
    const result = await jobService.getLatestJobByRequester(requester_id)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: error.message })
  }
}


exports.findjobbymch_idanddate_time = async (req, res) =>{
  res.json(await jobService.findjobbymch_idanddate_time(req.body));
}
