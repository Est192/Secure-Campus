# SecureCampus Frontend-to-API Mapping

This document maps the current frontend routes and interactive surfaces to the
available Laravel API and is the source of truth for frontend integration.
Authentication, the people directory, document management, requests, and
profile settings are connected to their listed endpoints. Other mock-backed
surfaces remain unchanged unless stated below.

Base URL: `http://localhost:8080`

Protected requests use:

```http
Accept: application/json
Content-Type: application/json
```

Send the login response token in the `Authorization` header with the `Bearer`
scheme.

For document uploads, use `multipart/form-data` instead of JSON.

## Mapping conventions

- Request and response DTO names below are documentation-level TypeScript
  contract names, not frontend classes that already exist.
- `Paginated<T>` means Laravel's resource collection envelope:
  `{ data: T[], links, meta }`.
- `Resource<T>` means `{ data: T }`.
- Successful creates return HTTP 201, successful deletes return HTTP 204,
  and validation failures return HTTP 422.
- List endpoints accept `per_page` (default 15, maximum 100). Generic
  resources also support applicable `search` and filters.
- Protected API routes require a bearer token. Login and `/api/health` do not.

## Page and interaction mapping

### Login — `/login`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Login form | `/api/v1/auth/login` | POST | `LoginRequest` | `LoginResponse` |
| Sign out in profile menu | `/api/v1/auth/logout` | POST | `EmptyRequest` | `LogoutResponse` |
| Forgot password / reset form | No endpoint available | — | — | — |

The login form and sign-out action use the listed endpoints. Session tokens and
the authenticated user are persisted in browser local storage. The backend
does not provide password-reset endpoints.

### Shared application layout

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Sidebar and profile menu | `/api/v1/users/{userId}` | GET | `EmptyRequest` | `Resource<UserDto>` |
| Global search input | Resource collection endpoint with `?search={query}` | GET | `ListQuery` | `Paginated<T>` |
| Notifications menu / mark all read | No notification endpoint available | — | — | — |
| Language selector | No API call; persisted in browser local storage | — | — | — |

The current global search input has no submit or query behavior. The profile
data is mock data. Language selection is intentionally client-side; it does
not need a backend endpoint.

### Dashboard — `/`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Dashboard user greeting and profile | Authenticated user session; `/api/v1/users/{userId}` for session restore | GET | `EmptyRequest` | `Resource<UserDto>` |
| Academic group table and count | `/api/v1/academic-groups` | GET | `AcademicGroupListQuery` | `Paginated<AcademicGroupDto>` |
| Pending request count | `/api/v1/requests?status=Pending` | GET | `RequestListQuery` | `Paginated<RequestDto>` |
| Document count | `/api/v1/documents` | GET | `DocumentListQuery` | `Paginated<DocumentDto>` |
| Attendance and performance chart | No attendance or performance-history endpoint | — | — | — |
| Recent activity feed | No activity endpoint or persisted activity source | — | — | — |
| Upcoming schedule | No calendar/event endpoint | — | — | — |
| Role preview selector | No API call; local-only display state | — | — | — |
| New request action | Navigate to `/requests`; creation occurs on the Requests page | — | — | — |
| Course report export | No export endpoint available | — | — | — |

The dashboard derives academic-group, pending-request, and document counts
from the visible paginated resources. Attendance and performance history,
activity, and calendar data are not fabricated. The API does not currently
expose a dashboard summary, attendance records, grade history, or activity
feed. A proposed endpoint contract is documented in
[dashboard-summary-proposal.md](./dashboard-summary-proposal.md); no dashboard
summary endpoint currently exists.

### Academics — `/academics`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Academic group/course list | `/api/v1/academic-groups` | GET | `AcademicGroupListQuery` | `Paginated<AcademicGroupDto>` |
| Subject catalog | `/api/v1/subjects` | GET | `ListQuery` | `Paginated<SubjectDto>` |
| Related student enrollments | `/api/v1/enrollments` | GET | `EnrollmentListQuery` | `Paginated<EnrollmentDto>` |
| Browse courses dialog | No separate endpoint; use the list endpoints above | GET | `AcademicGroupListQuery` | `Paginated<AcademicGroupDto>` |

The Academics view renders academic groups, subjects, and enrollments as
separate paginated lists. The backend does not yet define a
subject-to-academic-group association, so the frontend does not imply a course
catalog relationship that the API cannot provide.

### Grades — `/grades`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Grade list | `/api/v1/grades` | GET | `GradeListQuery` | `Paginated<GradeDto>` |
| Grade details | `/api/v1/grades/{gradeId}` | GET | `EmptyRequest` | `Resource<GradeDto>` |
| Create grade (academic manager) | `/api/v1/grades` | POST | `CreateGradeDto` | `Resource<GradeDto>` |
| Update grade (academic manager or assigned teacher) | `/api/v1/grades/{gradeId}` | PATCH | `UpdateGradeDto` | `Resource<GradeDto>` |
| Delete grade (authorized academic manager) | `/api/v1/grades/{gradeId}` | DELETE | `EmptyRequest` | `NoContent` |

The backend calculates `average_grade` from non-null partial/final grades;
clients do not submit the average.

### Documents — `/documents`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Document list | `/api/v1/documents` | GET | `DocumentListQuery` | `Paginated<DocumentDto>` |
| Upload document dialog | `/api/v1/documents` | POST | `UploadDocumentDto` (multipart) | `Resource<DocumentDto>` |
| View document metadata | `/api/v1/documents/{documentId}` | GET | `EmptyRequest` | `Resource<DocumentDto>` |
| Download document | `/api/v1/documents/{documentId}/download` | GET | `EmptyRequest` | `BinaryFileResponse` |
| Delete document | `/api/v1/documents/{documentId}` | DELETE | `EmptyRequest` | `NoContent` |

The document page lists and displays document metadata, uploads multipart files
with progress, downloads the stored file, and deletes documents. The API
accepts PDF, PNG, JPG/JPEG, DOC, or DOCX files up to 10 MB. Document update is
not currently supported by the API.

### Requests — `/requests`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Request list | `/api/v1/requests` | GET | `RequestListQuery` | `Paginated<RequestDto>` |
| Create request dialog | `/api/v1/requests` | POST | `CreateRequestDto` | `Resource<RequestDto>` |
| View request | `/api/v1/requests/{requestId}` | GET | `EmptyRequest` | `Resource<RequestDto>` |
| Update owned Pending request | `/api/v1/requests/{requestId}` | PATCH | `UpdateRequestDto` | `Resource<RequestDto>` |
| Review or approve/reject request | `/api/v1/requests/{requestId}/status` | PATCH | `TransitionRequestStatusDto` | `Resource<RequestDto>` |
| Delete request | `/api/v1/requests/{requestId}` | DELETE | `EmptyRequest` | `NoContent` |

Valid workflow: Pending → Under Review or Rejected; Under Review → Approved
or Rejected. Approved and Rejected are terminal statuses.

The requests page supports creation, details, edits for a user's own Pending
requests, manager status transitions, and manager deletion. Status options use
the backend's exact capitalization.

### Groups — `/groups`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Academic group list | `/api/v1/academic-groups` | GET | `AcademicGroupListQuery` | `Paginated<AcademicGroupDto>` |
| Create academic group dialog | `/api/v1/academic-groups` | POST | `CreateAcademicGroupDto` | `Resource<AcademicGroupDto>` |
| View academic group | `/api/v1/academic-groups/{groupId}` | GET | `EmptyRequest` | `Resource<AcademicGroupDto>` |
| Update academic group | `/api/v1/academic-groups/{groupId}` | PATCH | `UpdateAcademicGroupDto` | `Resource<AcademicGroupDto>` |
| Delete academic group | `/api/v1/academic-groups/{groupId}` | DELETE | `EmptyRequest` | `NoContent` |

The Groups route is presented as Academic Groups. Backend Academic Groups
represent academic classes, not clubs; there is no student club or
organization endpoint.

### People — `/people`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| People directory | `/api/v1/users` | GET | `UserListQuery` | `Paginated<UserDto>` |
| Students directory | `/api/v1/students` | GET | `UserListQuery` | `Paginated<UserDto>` |
| Teachers directory | `/api/v1/teachers` | GET | `UserListQuery` | `Paginated<UserDto>` |
| Role selector (administrator create-user form) | `/api/v1/roles` | GET | `ListQuery` | `Paginated<RoleDto>` |
| Create user dialog | `/api/v1/users` | POST | `CreateUserDto` | `Resource<UserDto>` |
| Create student | `/api/v1/students` | POST | `CreateStudentDto` | `Resource<UserDto>` |
| Create teacher | `/api/v1/teachers` | POST | `CreateTeacherDto` | `Resource<UserDto>` |
| User detail | `/api/v1/users/{userId}` | GET | `EmptyRequest` | `Resource<UserDto>` |

The people page has All Users, Students, and Teachers tabs with server-side
search and pagination. Role-specific student and teacher endpoints are
manager-only for collection reads and writes. Administrator creation uses the
roles collection to supply the required `role_id` to `/users`; student and
teacher creation uses their role-specific endpoints. Directory views show an
access message instead of issuing role-specific calls for non-managers.

### Reports — `/reports`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Student report | `/api/v1/reports/students` | GET | `ReportListQuery` | `Paginated<UserDto>` |
| Teacher report | `/api/v1/reports/teachers` | GET | `ReportListQuery` | `Paginated<UserDto>` |
| Grade report | `/api/v1/reports/grades` | GET | `GradeReportQuery` | `Paginated<GradeDto>` |
| Academic group report | `/api/v1/reports/academic-groups` | GET | `ReportListQuery` | `Paginated<AcademicGroupDto>` |
| Export report | No report-export endpoint available | — | — | — |
| Weekly progress chart | No weekly progress endpoint available | — | — | — |
| Attendance by subject chart | No attendance endpoint available | — | — | — |

The Reports page displays paginated API records in four report tables.
Progress and attendance chart areas remain placeholders because the available
endpoints do not provide chart aggregates. Report endpoints are restricted to
Administrators and Department Heads.

### Calendar — `/calendar`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Upcoming events and appointments | No calendar/event endpoint available | — | — | — |

Calendar entries are hardcoded in the current frontend. The backend has no
event, timetable, or appointment resource.

### Settings — `/settings`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Load current profile | `/api/v1/users/{userId}` | GET | `EmptyRequest` | `Resource<UserDto>` |
| Save profile | `/api/v1/users/{userId}` | PATCH | `UpdateUserProfileDto` | `Resource<UserDto>` |

For a profile update, send first/last name, email, phone, or degree-program ID
as applicable. The current settings UI uses a single full-name field and a
free-text program name; those values need adapting to `first_name`,
`last_name`, and `degree_program_id`. Users must not be allowed to update
their own role.

### Help — `/help`

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| Help topics and privacy information | No help-content endpoint available | — | — | — |

Help content is static and does not require an API call in the current
implementation.

## API-only management surfaces

These backend resources have no dedicated page in the current frontend. They
can be surfaced as administrator or department-management screens later.

| Frontend Page | API Endpoint | HTTP Method | Request DTO | Response DTO |
|---|---|---|---|---|
| No current UI — roles | `/api/v1/roles` | GET, POST | `CreateRoleDto` for POST | `Paginated<RoleDto>` for GET; `Resource<RoleDto>` for POST |
| No current UI — role detail | `/api/v1/roles/{roleId}` | GET, PUT/PATCH, DELETE | `UpdateRoleDto` for PUT/PATCH | `Resource<RoleDto>` for GET/PUT/PATCH; `NoContent` for DELETE |
| No current UI — degree programs | `/api/v1/degree-programs` | GET, POST | `CreateDegreeProgramDto` for POST | `Paginated<DegreeProgramDto>` for GET; `Resource<DegreeProgramDto>` for POST |
| No current UI — degree program detail | `/api/v1/degree-programs/{programId}` | GET, PUT/PATCH, DELETE | `UpdateDegreeProgramDto` for PUT/PATCH | `Resource<DegreeProgramDto>` for GET/PUT/PATCH; `NoContent` for DELETE |
| No current UI — subject catalog management | `/api/v1/subjects` | GET, POST | `CreateSubjectDto` for POST | `Paginated<SubjectDto>` for GET; `Resource<SubjectDto>` for POST |
| No current UI — subject detail | `/api/v1/subjects/{subjectId}` | GET, PUT/PATCH, DELETE | `UpdateSubjectDto` for PUT/PATCH | `Resource<SubjectDto>` for GET/PUT/PATCH; `NoContent` for DELETE |
| No current UI — enrollment management | `/api/v1/enrollments` | GET, POST | `CreateEnrollmentDto` for POST | `Paginated<EnrollmentDto>` for GET; `Resource<EnrollmentDto>` for POST |
| No current UI — enrollment detail | `/api/v1/enrollments/{enrollmentId}` | GET, PUT/PATCH, DELETE | `UpdateEnrollmentDto` for PUT/PATCH | `Resource<EnrollmentDto>` for GET/PUT/PATCH; `NoContent` for DELETE |
| No current UI — generic user management | `/api/v1/users` | GET, POST | `CreateUserDto` for POST | `Paginated<UserDto>` for GET; `Resource<UserDto>` for POST |
| No current UI — user detail | `/api/v1/users/{userId}` | GET, PUT/PATCH, DELETE | `UpdateUserDto` for PUT/PATCH | `Resource<UserDto>` for GET/PUT/PATCH; `NoContent` for DELETE |

## DTO contract reference

These DTO definitions summarize the current Laravel validation rules and
resource output. Optional properties may be omitted; nullable properties may
be explicitly `null`.

```ts
type LoginRequest = {
  email: string;
  password: string;
  device_name?: string;
};

type LoginResponse = {
  data: UserDto;
  token: string;
  token_type: "Bearer";
};

type LogoutResponse = { message: string };
type EmptyRequest = Record<string, never>;
type NoContent = null; // HTTP 204 with an empty response body

type UserDto = {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role_id: number | null;
  status: "active" | "inactive" | "suspended";
  degree_program_id: number | null;
  academic_group_id: number | null;
  student_number: string | null;
  employee_number: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type CreateUserDto = {
  first_name?: string;
  last_name?: string;
  name?: string; // Legacy alternative to first_name and last_name
  email: string;
  password: string; // Minimum 12 characters
  role_id?: number;
  status?: "active" | "inactive" | "suspended";
  degree_program_id?: number | null;
  academic_group_id?: number | null;
  student_number?: string | null;
  employee_number?: string | null;
  phone?: string | null;
};
type UpdateUserDto = Partial<CreateUserDto>;
type CreateStudentDto = Omit<CreateUserDto, "role_id" | "employee_number">;
type CreateTeacherDto = Omit<CreateUserDto, "role_id" | "student_number" | "degree_program_id" | "academic_group_id">;
type UpdateUserProfileDto = Pick<UpdateUserDto, "first_name" | "last_name" | "email" | "phone" | "degree_program_id">;

type RoleDto = { id: number; name: string; created_at: string; updated_at: string };
type CreateRoleDto = { name: string };
type UpdateRoleDto = Partial<CreateRoleDto>;

type DegreeProgramDto = {
  id: number; name: string; code: string; description: string | null;
  created_at: string; updated_at: string;
};
type CreateDegreeProgramDto = Pick<DegreeProgramDto, "name" | "code"> &
  Partial<Pick<DegreeProgramDto, "description">>;
type UpdateDegreeProgramDto = Partial<CreateDegreeProgramDto>;

type SubjectDto = {
  id: number; name: string; code: string; description: string | null; credits: number;
  created_at: string; updated_at: string;
};
type CreateSubjectDto = Pick<SubjectDto, "name" | "code"> &
  Partial<Pick<SubjectDto, "description" | "credits">>;
type UpdateSubjectDto = Partial<CreateSubjectDto>;

type AcademicGroupDto = {
  id: number; name: string; degree_program_id: number; teacher_id: number | null;
  academic_year: string; semester: string; created_at: string; updated_at: string;
};
type CreateAcademicGroupDto = Pick<AcademicGroupDto, "name" | "degree_program_id" | "academic_year" | "semester"> &
  Partial<Pick<AcademicGroupDto, "teacher_id">>;
type UpdateAcademicGroupDto = Partial<CreateAcademicGroupDto>;

type EnrollmentDto = {
  id: number; student_id: number; academic_group_id: number;
  status: "active" | "withdrawn" | "completed"; enrolled_at: string | null;
  created_at: string; updated_at: string;
};
type CreateEnrollmentDto = Pick<EnrollmentDto, "student_id" | "academic_group_id"> &
  Partial<Pick<EnrollmentDto, "status" | "enrolled_at">>;
type UpdateEnrollmentDto = Partial<CreateEnrollmentDto>;

type GradeDto = {
  id: number; enrollment_id: number; subject_id: number;
  first_partial: string | null; second_partial: string | null;
  third_partial: string | null; final_grade: string | null; average_grade: string | null;
  created_at: string; updated_at: string;
};
type CreateGradeDto = Pick<GradeDto, "enrollment_id" | "subject_id"> &
  Partial<Pick<GradeDto, "first_partial" | "second_partial" | "third_partial" | "final_grade">>;
type UpdateGradeDto = Partial<CreateGradeDto>;

type DocumentDto = {
  id: number; user_id: number | null; title: string; category: string | null;
  disk: string; path: string; mime_type: string | null; size: number | null;
  metadata: { original_name?: string } | null; created_at: string; updated_at: string;
};
type UploadDocumentDto = { title: string; category?: string | null; file: File };
type BinaryFileResponse = Blob;

type RequestDto = {
  id: number; user_id: number; type: string; title: string; description: string | null;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  review_notes: string | null; created_at: string; updated_at: string;
};
type CreateRequestDto = Pick<RequestDto, "type" | "title"> &
  Partial<Pick<RequestDto, "description">>;
type UpdateRequestDto = Partial<CreateRequestDto>;
type TransitionRequestStatusDto = {
  status: "Under Review" | "Approved" | "Rejected";
  review_notes?: string | null;
};

type Paginated<T> = {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; from: number | null; last_page: number; per_page: number; to: number | null; total: number };
};
type Resource<T> = { data: T };
type ListQuery = { page?: number; per_page?: number; search?: string };
type EnrollmentListQuery = ListQuery & { status?: EnrollmentDto["status"]; student_id?: number; academic_group_id?: number };
type GradeListQuery = ListQuery & { student_id?: number; academic_group_id?: number; subject_id?: number };
type DocumentListQuery = ListQuery & { user_id?: number };
type RequestListQuery = ListQuery & { status?: RequestDto["status"] };
type UserListQuery = ListQuery & { status?: UserDto["status"]; degree_program_id?: number; academic_group_id?: number };
type AcademicGroupListQuery = ListQuery & { degree_program_id?: number };
type ReportListQuery = { page?: number; per_page?: number };
type GradeReportQuery = ReportListQuery & { academic_group_id?: number };
```

Grade values are serialized by Eloquent as decimal strings. Treat them as
strings in transport DTOs and convert to numbers in the UI only when doing
numeric calculations.

## Integration gaps to resolve

1. Replace `campusService` mock reads with API clients and add auth token
   storage/401 handling.
2. Add a backend summary endpoint for dashboard statistics and chart data,
   with clear definitions for attendance, progress, and activity.
3. Decide whether "Groups" means academic groups, clubs, or both; the current
   page describes clubs while the API models classes.
4. Add calendar/event and notification APIs if those UI features should be
   dynamic.
5. Add report export and document update endpoints only if required by the
   product workflow.
6. Adapt settings to separate first/last name and select a degree program by
   ID; ensure the active user ID comes from the authenticated identity.
7. Connect the login form to the token endpoint and logout to token revocation;
   password reset remains unsupported.
