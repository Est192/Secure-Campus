# SecureCampus Database Schema

PostgreSQL is the system of record. Primary keys are generated numeric IDs;
foreign-key relationships use cascading deletes or nullable references as
specified below. All application tables include Laravel timestamps unless
noted.

## Domain tables

| Table | Columns | Relationships and constraints |
| --- | --- | --- |
| `roles` | `id`, `name`, `created_at`, `updated_at` | Unique role name. Seeded names: Administrator, Teacher, Department Head, Student. |
| `degree_programs` | `id`, `name`, `code`, `description`, timestamps | Unique `code`. Has academic groups and may be associated with users. |
| `users` | `id`, `name`, `first_name`, `last_name`, `email`, `email_verified_at`, `password`, `remember_token`, `role_id`, `status`, `degree_program_id`, `academic_group_id`, `student_number`, `employee_number`, `phone`, timestamps | Unique email and optional unique student/employee numbers. `role_id` and `degree_program_id` may be null. `academic_group_id` is nullable. |
| `academic_groups` | `id`, `name`, `degree_program_id`, `teacher_id`, `academic_year`, `semester`, timestamps | Belongs to a degree program; optional teacher references `users`. |
| `subjects` | `id`, `name`, `code`, `description`, `credits`, timestamps | Unique code; credits default to 1. |
| `enrollments` | `id`, `student_id`, `academic_group_id`, `status`, `enrolled_at`, timestamps | Student references `users`; group references `academic_groups`; unique student/group pair. |
| `grades` | `id`, `enrollment_id`, `subject_id`, `first_partial`, `second_partial`, `third_partial`, `final_grade`, `average_grade`, timestamps | Belongs to an enrollment and subject; unique enrollment/subject pair. Grades are decimals in the 0–100 range. |
| `documents` | `id`, `user_id`, `title`, `category`, `disk`, `path`, `mime_type`, `size`, `metadata`, timestamps | Optional owner references `users`; storage metadata contains the original filename. Binary files live on Laravel Storage, not in PostgreSQL. |
| `requests` | `id`, `user_id`, `type`, `title`, `description`, `status`, `review_notes`, timestamps | Belongs to a user. Status is Pending, Under Review, Approved, or Rejected. |

`name` remains on `users` for compatibility with Laravel authentication and
legacy clients. `first_name` and `last_name` are the profile fields; the User
model keeps `name` synchronized when these fields are written. Existing names
are split once by the profile migration. Status defaults to `active`; accepted
user statuses are `active`, `inactive`, and `suspended`.

## Laravel infrastructure tables

The base Laravel migration also creates `password_reset_tokens`, `sessions`,
`cache`, `cache_locks`, `jobs`, `job_batches`, and `failed_jobs`. Sanctum token
records are stored in `personal_access_tokens`.

## Relationship summary

```text
Role 1 ── * User
DegreeProgram 1 ── * AcademicGroup
DegreeProgram 1 ── * User (optional)
User (Teacher) 1 ── * AcademicGroup (optional)
User (Student) 1 ── * Enrollment
AcademicGroup 1 ── * Enrollment
Enrollment 1 ── * Grade
Subject 1 ── * Grade
User 1 ── * Document
User 1 ── * Request
```

The schema does not create separate `students` or `teachers` tables; both are
users distinguished by their role and optional student/employee identifiers.
There is no explicit subject-to-academic-group pivot in this initial model.

## Migrations

`2025_01_01_000000_create_application_tables` creates Laravel infrastructure
and the initial users table. The `2026_10_11_*` migrations add campus-domain
tables, Sanctum token storage, and the user profile fields. Apply changes with
`docker compose exec app php artisan migrate --force`.
