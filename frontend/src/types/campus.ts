export type MockRecord = {
  id: string;
  titleKey: string;
  detailKey: string;
  statusKey: string;
};

export type CourseRecord = {
  id: string;
  code: string;
  titleKey: string;
  instructorKey: string;
  credits: number;
  progress: number;
  grade: string;
};

export type StatRecord = {
  id: string;
  titleKey: string;
  value: string;
  changeKey: string;
  icon: "attendance" | "courses" | "requests" | "documents";
  positive?: boolean;
};

export type ActivityRecord = {
  id: string;
  titleKey: string;
  detailKey: string;
  timeKey: string;
  tone: "success" | "info" | "warning";
};

export type ProfileRecord = {
  name: string;
  email: string;
  roleKey: string;
  initials: string;
};
