const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const {User, Student, Teacher, Admin} = require('../admin/accounts/model')
const {Role} = require('../admin/roles/model')


const getUserFromToken = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN)
    try {
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token
        }).populate('roles')
        if (!user) {
            throw new Error('No user found')
        }
        req.user = user
        req.token = token
        addMergePrivileges(req, res)
        
    } catch (error) {
        throw new Error(error.message)
    }
}

const addMergePrivileges = async(req, res) => {
    const user = req.user
    let mergedPrivileges = user.privileges 
    user.roles.forEach(role => {
        mergedPrivileges = mergedPrivileges.concat(role.privileges)
    });
    req.mergedPrivileges = [...new Set(mergedPrivileges)]
}

const runInTransaction = async function(ops, TargetModel) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const res = await TargetModel.bulkWrite(ops, {session})
        await session.commitTransaction()
        return res
    } catch (error){
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}

module.exports = {
    getUserFromToken,
    addMergePrivileges,
    runInTransaction
}