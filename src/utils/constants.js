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
    HALL_UPDATE: "hall-update",

    LEVEL_CHANGING_FEE_MANAGEMENT: "level-changing-fee-management",
    DINING_FEE_MANAGEMENT: "dining-fee-management",
    EXAM_FEE_MANAGEMENT: "exam-fee-management",

    LIBRARY_FINE_MANAGEMENT: 'library-fine-management',
    LAB_FINE_MANAGEMENT: 'laboratory-fine-management',
    DISCIPLINARY_FINE_MANAGEMENT: 'disciplinary-fine-management'
})

const USER_TYPES = Object.freeze({
    ADMIN: "admin",
    STUDENT: "student",
    TEACHER: "teacher"
})

const TF_PARTS = Object.freeze({
    A: 'A',
    B: 'B',
    NONE: '-'
})
const DUE_TYPES = Object.freeze({
    LEVEL_CHANGING_FEE: "level-changing-fee",
    EXAM_FEE: "exam-fee",
    DINING_FEE: "dining-fee"
})

const RESULT_STATUS = Object.freeze( {
    EXAMINER: "examiners",
    SCRUTINIZER: "scrutinizers",
    INTERNAL: "internal",
    DEPARTMENT_HEAD: "department-head",
    ECO: "exam-controller-office"
})

const ISSUE_EVAL_TYPE = Object.freeze({
    COURSE_EVAL: "course-eval",
    TF_EVAL: "term-final-eval"
})

const ISSUE_POST_TYPE = Object.freeze({
    COMMENT: "comment",
    ACTIVITY: "activity"
})

const ISSUE_STATUS = Object.freeze({
  UNRESOLVED: "unresolved",
  RESOLVED: "resolved"
})

const DUE_STATUS = Object.freeze({
    PENDING: "pending",
    CLEARED: "cleared"
})

const FINE_TYPES = Object.freeze({
    LIBRARY_FINE: 'library-fine',
    LAB_FINE: 'laboratory-fine',
    DISCIPLINARY_FINE: 'disciplinary-fine'
})

module.exports = Object.freeze({
    MIN_TERM: 1,
    MAX_TERM: 5,
    MIN_LEVEL: 1,
    MAX_LEVEL: 2,
    USER_TYPES,
    PRIVILEGES,
    DUE_TYPES,
    RESULT_STATUS,
    ISSUE_STATUS,
    ISSUE_POST_TYPE,
    ISSUE_EVAL_TYPE,
    TF_PARTS,
    DUE_STATUS,
    FINE_TYPES
})
