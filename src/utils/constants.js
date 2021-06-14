const PRIVILEGES = Object.freeze({
    ACCOUNT_CREATION: "account-creation",
    ACCOUNT_DELETION: "account-deletion",
    ACCOUNT_UPDATE: "account-update",
    COURSE_CREATION: "course-creation",
    COURSE_UPDATE: "course-update",
    COURSE_DELETION: "course-deletion",
})

const USER_TYPES = Object.freeze({
    ADMIN: "admin",
    STUDENT: "student",
    TEACHER: "teacher"
})

const RESULT_STATUS = Object.freeze( {
    EXAMINER: "examiner",
    SCRUTINIZER: "scrutinizer",
    INTERNAL: "internal",
    DEPARTMENT_HEAD: "department-head",
    ECO: "exam-controller-office"
})


module.exports = Object.freeze({
    MIN_TERM: 1,
    MAX_TERM: 5,
    MIN_LEVEL: 1,
    MAX_LEVEL: 2,
    USER_TYPES,
    PRIVILEGES,
    RESULT_STATUS
})
