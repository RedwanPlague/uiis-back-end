const constants = require('../utils/constants')
const {getUserFromToken} = require('./helpers')


const logInRequired = async (req, res, next) => {
    try {
        await getUserFromToken(req, res)
        next()
    } catch (error) {
        res.status(401).send(error)
    }
}

const adminRequired = async (req, res, next) => {
    try{
        await getUserFromToken(req, res)
        console.log(req.user)
        if (req.user.userType !== constants.USER_TYPES.ADMIN) {
            throw new Error('User must be admin')
        }
        next()
    } catch (error) {
        res.status(401).send({
            error: error.message
        })
    }
}

module.exports = {
    logInRequired,
    adminRequired
}