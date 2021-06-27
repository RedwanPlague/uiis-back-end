const setKe = (req, res, next) => {
    try {
        req.ke = req.originalUrl.split("/")[2];
        next();
    } catch (error) {
        res.status(401).send(error)
    }
}

module.exports = {
    setKe,
}