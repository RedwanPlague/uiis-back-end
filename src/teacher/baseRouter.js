const express = require('express');

const courseRouter = require('./courses/router');
const advisorRouter = require('./advisor/router');
const examinerRouter = require('./examiner/router');
const scrutinizerRouter = require('./scrutinizer/router');
const router = express.Router();

router.use('/advisor', advisorRouter);
router.use('/courses', courseRouter);
router.use('/examiner', examinerRouter);
router.use('/scrutinizer', scrutinizerRouter);

module.exports = router