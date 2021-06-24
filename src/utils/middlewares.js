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

function hasDueTypePrivilege(req, res, next) {
    try {
        if (!req.body.dueType){
            throw new Error("No dueType specified!")
        }
        else {
            let privilege = undefined
            if (req.body.dueType === constants.DUE_TYPES.LEVEL_CHANGING_FEE){
                privilege = constants.PRIVILEGES.LEVEL_CHANGING_FEE_MANAGEMENT
            }
            else if (req.body.dueType === constants.DUE_TYPES.DINING_FEE) {
                privilege = constants.PRIVILEGES.DINING_FEE_MANAGEMENT
            }
            else if (req.body.dueType === constants.DUE_TYPES.EXAM_FEE) {
                privilege = constants.PRIVILEGES.EXAM_FEE_MANAGEMENT
            }
            console.log(req.body.dueType, privilege)

            console.log(req.mergedPrivileges)

            if (req.mergedPrivileges.indexOf(privilege) < 0) {
                throw new Error("Permission Denied!")
            }
            next()
        }
    } catch (e) {
        res.status(400).send({error: e.message})
    }
}

function hasFinePrivilege(req, res, next) {
    try {
        if (!req.body.fineType){
            throw new Error("No fineType specified!")
        }
        else {
            let privilege = undefined
            if (req.body.fineType === constants.FINE_TYPES.LIBRARY_FINE){
                privilege = constants.PRIVILEGES.LIBRARY_FINE_MANAGEMENT
            }
            else if (req.body.fineType === constants.FINE_TYPES.LAB_FINE) {
                privilege = constants.PRIVILEGES.LAB_FINE_MANAGEMENT
            }
            else if (req.body.fineType === constants.FINE_TYPES.DISCIPLINARY_FINE) {
                privilege = constants.PRIVILEGES.DISCIPLINARY_FINE_MANAGEMENT
            }

            if (req.mergedPrivileges.indexOf(privilege) < 0) {
                throw new Error("Permission Denied!")
            }
            next()
        }
    } catch (e) {
        res.status(400).send({error: e.message})
    }
}

module.exports = {
    logInRequired,
    adminRequired,
    hasAllPrivileges,
    hasAnyPrivileges,
    hasDueTypePrivilege,
    hasFinePrivilege
}