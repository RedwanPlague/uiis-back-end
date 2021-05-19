const PRIVILEGES = Object.freeze({
    ACCOUNT_CREATION: "account-creation",
    ACCOUNT_DELETION: "account-deletion",
    ACCOUNT_UPDATE: "account-update",
    COURSE_CREATION: "courses-creation",
    COURSE_UPDATE: "courses-update",
    COURSE_DELETION: "courses-deletion",
})

const USER_TYPES = Object.freeze({
    ADMIN: "admin",
    STUDENT: "student",
    TEACHER: "teacher"
})



module.exports = Object.freeze({
    MIN_TERM: 1,
    MAX_TERM: 5,
    MIN_LEVEL: 1,
    MAX_LEVEL: 2,
    USER_TYPES,
    PRIVILEGES
})
