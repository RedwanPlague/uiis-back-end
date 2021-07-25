const express = require('express');

const advisorRouter = require('./advisor/router');
const courseRouter = require('./courses/router');
const examinerRouter = require('./examiner/router');
const headRouter = require('./head/router');
const issueRouter = require('./issues/router');
const scrutinizerRouter = require('./scrutinizer/router');
const ecoRouter = require('./eco/router');
const profileRouter = require('./teacher-common/profile/router');
const rolesRouter = require("./teacher-common/roles/router")

const router = express.Router();

router.use('/advisor', advisorRouter);
router.use('/courses', courseRouter);
router.use('/examiner', examinerRouter);
router.use('/head', headRouter);
router.use('/internal', scrutinizerRouter);
router.use('/issues', issueRouter);
router.use('/scrutinizer', scrutinizerRouter);
router.use('/eco', ecoRouter);
router.use('/roles', rolesRouter);
router.use('/', profileRouter);

module.exports = router
