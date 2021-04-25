const {getUserFromToken} = require('../../utils/helpers')
const constants = require('../../utils/constants')

const courseCreationAuth = async (req, res, next) => {
    try {
        await getUserFromToken(req, res)

        console.log(req.user)

        if (!req.user.privileges.includes(constants.PRIVILEGES.ACCOUNT_CREATION)) {
            throw new Error()
        }
        next()
    } catch (error){
        res.status(401).send({
            error: 'Please Authenticate'
        })
    }
}

module.exports = {
    courseCreationAuth
}