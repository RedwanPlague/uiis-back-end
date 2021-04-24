const PRIVILEGES = Object.freeze({
    ACCOUNT_CREATION: "account-creation",
    ACCOUNT_DELETION: "account-deletion",
    ACCOUNT_UPDATE: "account-update",
    COURSE_CREATION: "course-creation",
    COURSE_UPDATE: "course-update",
    COURSE_DELETION: "course-deletion",
})

module.exports = Object.freeze({
    MIN_TERM: 1,
    MAX_TERM: 5,
    MIN_LEVEL: 1,
    MAX_LEVEL: 2,
    PRIVILEGES,
    USER_TYPE_LIST: ['student', 'teacher', 'admin'],
})
