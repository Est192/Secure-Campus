# SecureCampus API Usage

Base URL for local development: `http://localhost:8080`.
All endpoints return JSON except document downloads. API paths are prefixed
with `/api/v1`; `/api/health` is unversioned and unauthenticated.

## Authentication

### Sign in

`POST /api/v1/auth/login` accepts JSON. Login is limited to 10 attempts per
minute per client.

```json
{
  "email": "admin@example.edu",
  "password": "use-the-configured-password",
  "device_name": "SecureCampus web"
}
```

The response contains `data` (the authenticated user), `token`, and
`token_type: "Bearer"`. Send the returned token on protected requests:

```http
Authorization: Bearer <token>
Accept: application/json
```

### Sign out

`POST /api/v1/auth/logout` revokes the current token.

The optional bootstrap account is controlled by `BOOTSTRAP_ADMIN_EMAIL` and
`BOOTSTRAP_ADMIN_PASSWORD` in `backend/.env`. Set both and run the seeder to
create it. A password of at least 12 characters is required; there are no
default credentials.

## Endpoint catalog

All paths below require authentication except `POST /auth/login` and
`GET /api/health`.

| Resource | Collection | Item | Notes |
| --- | --- | --- | --- |
| Roles | `GET, POST /api/v1/roles` | `GET, PUT/PATCH, DELETE /api/v1/roles/{role}` | Role writes are Administrator-only. |
| Users | `GET, POST /api/v1/users` | `GET, PUT/PATCH, DELETE /api/v1/users/{user}` | Profile fields include first/last name, email, password, role, and status. |
| Degree Programs | `GET, POST /api/v1/degree-programs` | `GET, PUT/PATCH, DELETE /api/v1/degree-programs/{degree_program}` | Standard CRUD. |
| Subjects | `GET, POST /api/v1/subjects` | `GET, PUT/PATCH, DELETE /api/v1/subjects/{subject}` | Standard CRUD. |
| Academic Groups | `GET, POST /api/v1/academic-groups` | `GET, PUT/PATCH, DELETE /api/v1/academic-groups/{academic_group}` | Standard CRUD. |
| Students | `GET, POST /api/v1/students` | `GET, PUT/PATCH, DELETE /api/v1/students/{student}` | Users assigned the Student role. |
| Teachers | `GET, POST /api/v1/teachers` | `GET, PUT/PATCH, DELETE /api/v1/teachers/{teacher}` | Users assigned the Teacher role. |
| Enrollments | `GET, POST /api/v1/enrollments` | `GET, PUT/PATCH, DELETE /api/v1/enrollments/{enrollment}` | Standard CRUD. |
| Grades | `GET, POST /api/v1/grades` | `GET, PUT/PATCH, DELETE /api/v1/grades/{grade}` | `average_grade` is computed server-side. |
| Requests | `GET, POST /api/v1/requests` | `GET, PUT/PATCH, DELETE /api/v1/requests/{request}` | Owners create/update pending requests; reviewers transition status. |
| Documents | `GET, POST /api/v1/documents` | `GET, DELETE /api/v1/documents/{id}` | Multipart upload; downloads use `/api/v1/documents/{id}/download`. |
| Student report | `GET /api/v1/reports/students` | — | Paginated student records. |
| Teacher report | `GET /api/v1/reports/teachers` | — | Paginated teacher records. |
| Grade report | `GET /api/v1/reports/grades` | — | Optional `academic_group_id` filter. |
| Academic group report | `GET /api/v1/reports/academic-groups` | — | Includes enrollment counts. |

`PATCH /api/v1/requests/{id}/status` takes `status` and optional `review_notes`.
Allowed transitions are Pending → Under Review or Rejected, and Under Review →
Approved or Rejected. Approved and Rejected requests are terminal.

List resources accept `per_page` from 1 through 100 (default 15). Generic
resource lists also support `search` and applicable filters such as `status`,
`degree_program_id`, `academic_group_id`, `student_id`, and `subject_id`.
Document lists accept `user_id` for administrators and department heads.

## Example: create a student

```http
POST /api/v1/students
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

```json
{
  "first_name": "Jordan",
  "last_name": "Lee",
  "email": "jordan.lee@example.edu",
  "password": "replace-with-a-long-secret",
  "student_number": "S-10425",
  "status": "active"
}
```

The API also accepts the legacy `name` field in place of first/last name. The
User model synchronizes the full name for existing Laravel integrations.

## Example: record grades

`POST /api/v1/grades` accepts `enrollment_id`, `subject_id`, and any of the
four nullable numeric marks `first_partial`, `second_partial`,
`third_partial`, and `final_grade` in the range 0–100. The server computes
`average_grade` as the arithmetic mean of the non-null marks, rounded to two
decimal places. Clients cannot set `average_grade` directly.

## Example: upload and download a document

Upload `title`, optional `category`, and `file` as `multipart/form-data`.
Accepted file extensions are PDF, PNG, JPG/JPEG, DOC, and DOCX, with a 10 MB
maximum. The API stores the file on Laravel's private `local` disk and returns
JSON metadata. Download through the authenticated
`GET /api/v1/documents/{id}/download` endpoint.

## Response and errors

Resource responses have a `data` object or array. Paginated responses include
Laravel `links` and `meta`. Validation failures use HTTP 422 with a JSON
`errors` map. Requests without a token return 401; insufficient permissions
return 403; unknown resource IDs return 404.

See [openapi.yaml](./openapi.yaml) for the machine-readable contract.
