const express = require('express');

const profileRouter = require('./profile/router');
const registrationRouter = require('./registrations/router');
const gradesRouter = require('./grades/router');
const duesRouter = require('./dues/router');

const router = express.Router();

router.use('/', profileRouter);
router.use('/registrations', registrationRouter);
router.use('/grades', gradesRouter);
router.use('/due', duesRouter);

module.exports = router;
