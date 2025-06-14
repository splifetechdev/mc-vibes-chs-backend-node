const jobRepository = require('../repositories/job.repository')

exports.listPendingJob = async (company_id) => await jobRepository.find_pending_job(company_id)

exports.listStartingJob = async (company_id) => await jobRepository.find_starting_job(company_id)

exports.listEndJob = async (company_id) => await jobRepository.find_end_job(company_id)

exports.createJob = async (data) => await jobRepository.create(data)

exports.updateJob = async (data) => {
  // await update opn ord status to end
  return await jobRepository.update(data)
}

exports.getLatestJobByRequester = async (requester_id) => {
  return await jobRepository.latestJobByUser(requester_id)
}


exports.findjobbymch_idanddate_time = async (data) =>  await jobRepository.findjobbymch_idanddate_time(data)