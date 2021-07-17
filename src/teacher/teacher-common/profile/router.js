const express = require('express');

const { Teacher } = require('../../../admin/accounts/model');

const router = express.Router();

router.get('/profile', async (req, res) => {
    try {
        const teacher = await Teacher
            .findById({
                _id: req.user._id
            })
            .select('_id name contactNumber email residentialAddress department');

        res.status(200).send(teacher);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
