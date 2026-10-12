import type {
  ActivityRecord,
  CourseRecord,
  MockRecord,
  ProfileRecord,
  StatRecord,
} from "../../types/campus";

const statistics: StatRecord[] = [
  {
    id: "attendance",
    titleKey: "stats.attendance",
    value: "96.4%",
    changeKey: "stats.attendanceChange",
    icon: "attendance",
  },
  {
    id: "courses",
    titleKey: "stats.activeCourses",
    value: "06",
    changeKey: "stats.courseChange",
    icon: "courses",
  },
  {
    id: "requests",
    titleKey: "stats.pendingRequests",
    value: "03",
    changeKey: "stats.pendingChange",
    icon: "requests",
    positive: false,
  },
  {
    id: "documents",
    titleKey: "stats.documents",
    value: "24",
    changeKey: "stats.documentChange",
    icon: "documents",
  },
];

const courses: CourseRecord[] = [
  {
    id: "cs-401",
    code: "CS 401",
    titleKey: "courseTitles.security",
    instructorKey: "instructorNames.williams",
    credits: 4,
    progress: 92,
    grade: "A",
  },
  {
    id: "math-315",
    code: "MATH 315",
    titleKey: "courseTitles.statistics",
    instructorKey: "instructorNames.kim",
    credits: 3,
    progress: 78,
    grade: "B+",
  },
  {
    id: "cs-322",
    code: "CS 322",
    titleKey: "courseTitles.networks",
    instructorKey: "instructorNames.patel",
    credits: 3,
    progress: 86,
    grade: "A-",
  },
  {
    id: "hum-204",
    code: "HUM 204",
    titleKey: "courseTitles.ethics",
    instructorKey: "instructorNames.garcia",
    credits: 3,
    progress: 64,
    grade: "B",
  },
];

const activity: ActivityRecord[] = [
  {
    id: "grade",
    titleKey: "activity.gradeTitle",
    detailKey: "activity.gradeDetail",
    timeKey: "activity.timeRecent",
    tone: "success",
  },
  {
    id: "document",
    titleKey: "activity.documentTitle",
    detailKey: "activity.documentDetail",
    timeKey: "activity.timeYesterday",
    tone: "info",
  },
  {
    id: "request",
    titleKey: "activity.requestTitle",
    detailKey: "activity.requestDetail",
    timeKey: "activity.timeThisWeek",
    tone: "warning",
  },
];

const records: Record<string, MockRecord[]> = {
  grades: [
    { id: "biology", titleKey: "gradeTitles.biology", detailKey: "grades.biology", statusKey: "grades.gradeA" },
    { id: "design", titleKey: "gradeTitles.design", detailKey: "grades.design", statusKey: "grades.gradeA" },
    { id: "seminar", titleKey: "gradeTitles.seminar", detailKey: "grades.seminar", statusKey: "grades.gradeB" },
    { id: "statistics", titleKey: "gradeTitles.statistics", detailKey: "grades.statistics", statusKey: "grades.gradeA" },
  ],
  documents: [
    { id: "transcript", titleKey: "documentTitles.transcript", detailKey: "documents.transcriptDate", statusKey: "status.approved" },
    { id: "enrollment", titleKey: "documentTitles.enrollment", detailKey: "documents.enrollmentDate", statusKey: "status.ready" },
    { id: "scholarship", titleKey: "documentTitles.scholarship", detailKey: "documents.scholarshipDate", statusKey: "status.processing" },
    { id: "student-id", titleKey: "documentTitles.studentId", detailKey: "documents.studentIdDate", statusKey: "status.approved" },
  ],
  requests: [
    { id: "transcript", titleKey: "requestTitles.transcript", detailKey: "requests.updatedYesterday", statusKey: "status.approved" },
    { id: "aid", titleKey: "requestTitles.financialAid", detailKey: "requests.dueSoon", statusKey: "status.inProgress" },
    { id: "advisor", titleKey: "requestTitles.advisor", detailKey: "requests.appointmentDate", statusKey: "status.scheduled" },
    { id: "replacement", titleKey: "requestTitles.replacement", detailKey: "requests.submittedDate", statusKey: "status.submitted" },
  ],
  groups: [
    { id: "research", titleKey: "groupTitles.research", detailKey: "groups.researchMembers", statusKey: "status.active" },
    { id: "design", titleKey: "groupTitles.design", detailKey: "groups.designMembers", statusKey: "status.active" },
    { id: "wellness", titleKey: "groupTitles.wellness", detailKey: "groups.wellnessMembers", statusKey: "status.open" },
    { id: "data", titleKey: "groupTitles.data", detailKey: "groups.dataMembers", statusKey: "status.open" },
  ],
  people: [
    { id: "maya", titleKey: "people.maya", detailKey: "people.advisor", statusKey: "people.emailMaya" },
    { id: "james", titleKey: "people.james", detailKey: "people.departmentHead", statusKey: "people.emailJames" },
    { id: "nora", titleKey: "people.nora", detailKey: "people.instructor", statusKey: "people.emailNora" },
    { id: "alex", titleKey: "people.alex", detailKey: "people.studentServices", statusKey: "people.emailAlex" },
  ],
};

const profile: ProfileRecord = {
  name: "Olivia Martin",
  email: "olivia.martin@securecampus.edu",
  roleKey: "roles.student",
  initials: "OM",
};

export const campusService = {
  async getStatistics(): Promise<StatRecord[]> {
    return statistics;
  },
  async getCourses(): Promise<CourseRecord[]> {
    return courses;
  },
  async getActivity(): Promise<ActivityRecord[]> {
    return activity;
  },
  async getRecords(section: string): Promise<MockRecord[]> {
    return records[section] ?? [];
  },
  getProfile(): ProfileRecord {
    return profile;
  },
};
