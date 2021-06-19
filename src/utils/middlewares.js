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

function hasAllPrivileges(privileges) {
    return function(req, res, next) {
        const found = privileges.every(privilege=> req.mergedPrivileges.indexOf(privilege) >= 0)
        if (!found){
            res.status(403).send({error: 'Permission denied'})
        }else {
            next()
        } 
    }
}

function hasAnyPrivileges(privileges) {
    return function(req, res, next) {
        const found = privileges.some(privilege=> req.mergedPrivileges.indexOf(privilege) >= 0)
        if (!found){
            res.status(403).send({error:'Permission denied'})
        }else {
            next()
        }
    }
}

module.exports = {
    logInRequired,
    adminRequired,
    hasAllPrivileges,
    hasAnyPrivileges
}