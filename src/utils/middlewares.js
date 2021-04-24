const jwt = require('jsonwebtoken')
const User = require('../admin/accounts/model')

const {getUserFromToken} = require('./helpers')

const logInRequired = async (req, res, next) => {
    try {
        await getUserFromToken(req, res)
        next()
    } catch (error) {
        res.status(401).send()
    }
}


module.exports = {
    logInRequired
}