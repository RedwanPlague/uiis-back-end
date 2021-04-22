const {getUserFromToken} = require('../../utils/helpers')

const courseCreationAuth = async (req, res, next) => {
    try {
        await getUserFromToken(req, res)

        console.log(req.user)

        if (!req.user.privileges.includes('course-creation')) {
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