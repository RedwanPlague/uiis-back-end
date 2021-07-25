const express = require('express');
const router = express.Router();

const CurrentSession = require("../../../admin/currentSessions/model");
const { CourseSession } = require("../../../admin/courseSessions/model");

router.get("/whoami", async (req, res) => {
    try {
        const roles = [];
        const user = req.user;
        const session = (await CurrentSession.findOne()).session;
        const eco = (await CurrentSession.findOne()).eco;

        const courseSessions1 = await CourseSession.find({
            session,
            "examiners.teacher": user.id,
        });
        if(courseSessions1.length > 0) roles.push("examiner");

        const courseSessions2 = await CourseSession.find({
            session,
            "scrutinizers.teacher": user.id,
        });
        if(courseSessions2.length > 0) roles.push("scrutinizer");

        const courseSessions3 = await CourseSession.find({
            session,
            "internals.teacher": user.id,
        });
        if(courseSessions3.length > 0) roles.push("internal");

        if(user.id === eco) roles.push("eco");
 
        res.send(roles);
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
});

module.exports = router;