const express = require('express');

const advisorRouter = require('./advisor/router');
const courseRouter = require('./courses/router');
const examinerRouter = require('./examiner/router');
const headRouter = require('./head/router');
const scrutinizerRouter = require('./scrutinizer/router');
const issueRouter = require('./issues/router');

const router = express.Router();

router.use('/advisor', advisorRouter);
router.use('/courses', courseRouter);
router.use('/examiner', examinerRouter);
router.use('/head', headRouter);
router.use('/scrutinizer', scrutinizerRouter);
router.use('/issues', issueRouter);

module.exports = router
