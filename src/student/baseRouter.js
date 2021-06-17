const express = require('express');

const basicRouter = require('./profile/router');
const registrationRouter = require('./registrations/router');
const gradesRouter = require('./grades/router');

const router = express.Router();

router.use('/', basicRouter);
router.use('/registrations', registrationRouter);
router.use('/grades', gradesRouter);

module.exports = router;
