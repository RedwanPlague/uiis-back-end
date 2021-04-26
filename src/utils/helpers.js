const jwt = require('jsonwebtoken')
const {User, Student, Teacher, Admin} = require('../admin/accounts/model')


const getUserFromToken = async (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN)
    const user = await User.findOne({
        _id: decoded._id,
        'tokens.token': token
    })

    if (!user) {
        throw new Error('No user found')
    }
    req.user = user
    req.token = token
}



module.exports = {
    getUserFromToken
}