const jwt = require('jsonwebtoken')
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


module.exports = {
    getUserFromToken,
    addMergePrivileges
}