const express = require('express');
const router =  express.Router();

router.get('/registrations', async (req, res)=> {
	try{
		console.log(req.user)
		const departments = await Department.find({})
		res.send(departments)

	} catch(error) {
		res.status(400).send()
	}
})

