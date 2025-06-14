const router = require("express").Router();
const jobController = require('../controllers/job.controller')
const jobWorkerController = require('../controllers/job_worker.controller')


router.post('/:job_id', jobWorkerController.createJobWorker)
router.delete('/:job_id/worker/:job_worker_id', jobWorkerController.removeJobWorker)

router.get('/latest', jobController.getLatestJobByRequester)
router.get('/', jobController.listJob)
router.post('/', jobController.createJob)
router.put('/', jobController.updateJob)

router.post('/get/findjobbymch_idanddate_time', jobController.findjobbymch_idanddate_time);

module.exports = router;