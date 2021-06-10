const express = require('express');

const basicRouter = require('./basic/router');
const registrationRouter = require('./registrations/router');

const router = express.Router();

router.use('/', basicRouter);
router.use('/registrations', registrationRouter);

module.exports = router;
