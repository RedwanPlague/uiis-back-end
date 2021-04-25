const jwt = require('jsonwebtoken')
const User = require('../admin/accounts/model')
const constants = require('../utils/constants')

const {getUserFromToken} = require('./helpers')

const logInRequired = async (req, res, next) => {
    try {
        await getUserFromToken(req, res)
        next()
    } catch (error) {
        res.status(401).send()
    }
}

const adminRequired = async (req, res, next) => {
    try{
        await getUserFromToken(req, res)
        if (req.user.userType !== constants.USER_TYPES.ADMIN) {
            throw new Error()
        }
        next()
    } catch (error) {
        res.status(401).send()
    }
}

module.exports = {
    logInRequired,
    adminRequired
}