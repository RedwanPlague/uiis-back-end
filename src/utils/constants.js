const PRIVILEGES = Object.freeze({
    ACCOUNT_CREATION: "account-creation",
    ACCOUNT_DELETION: "account-deletion",
    ACCOUNT_UPDATE: "account-update",

    COURSE_CREATION: "course-creation",
    COURSE_UPDATE: "course-update",
    COURSE_DELETION: "course-deletion",

    CURRENT_SESSION_UPDATE: "current-session-update",

    COURSE_SESSION_CREATION: "course-session-creation",
    COURSE_SESSION_UPDATE: "course-session-update",
    COURSE_SESSION_ASSIGN_EXAMINER: "course-session-assign-examiner",
    COURSE_SESSION_ASSIGN_TEACHER: "course-session-assign-teacher",
    COURSE_SESSION_ASSIGN_SCRUTINIZER: "course-session-assign-scrutinizer",
    COURSE_SESSION_ASSIGN_RESULT_ACCESS_HOLDER: "course-session-assign-result-access-holder",
    COURSE_SESSION_ALLOT_SCHEDULE: "course-session-allot-schedule",

    SLOT_CREATION: "slot-creation",
    SLOT_UPDATE: "slot-update",

    ROLE_CREATION: "role-creation",
    ROLE_UPDATE: "role-update",
    ROLE_DELETION: "role-deletion",

    DEPARTMENT_CREATION: "department-creation",
    DEPARTMENT_UPDATE: "department-update",

    HALL_CREATION: "hall-creation",
    HALL_UPDATE: "hall-update"
})

const USER_TYPES = Object.freeze({
    ADMIN: "admin",
    STUDENT: "student",
    TEACHER: "teacher"
})


const RESULT_STATUS = Object.freeze( {
    EXAMINER: "examiners",
    SCRUTINIZER: "scrutinizers",
    INTERNAL: "internal",
    DEPARTMENT_HEAD: "department-head",
    ECO: "exam-controller-office"
})

const ISSUE_STATUS = Object.freeze({
  UNRESOLVED: "unresolved",
  RESOLVED: "resolved"
})

module.exports = Object.freeze({
    MIN_TERM: 1,
    MAX_TERM: 5,
    MIN_LEVEL: 1,
    MAX_LEVEL: 2,
    USER_TYPES,
    PRIVILEGES,
    RESULT_STATUS,
    ISSUE_STATUS
})
