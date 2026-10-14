<?php

namespace Tests\Feature;

use App\Models\DegreeProgram;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CoreApiTest extends TestCase
{
    use DatabaseTransactions;

    private User $administrator;

    protected function setUp(): void
    {
        parent::setUp();
        $role = Role::firstOrCreate(['name' => 'Administrator']);
        $this->administrator = User::factory()->create(['role_id' => $role->id]);
        $this->actingAs($this->administrator, 'sanctum');
    }

    public function test_degree_program_crud_and_subject_collection_are_json_resources(): void
    {
        $program = $this->postJson('/api/v1/degree-programs', [
            'name' => 'Computer Science',
            'code' => 'CS-'.uniqid(),
            'description' => 'Computing degree program',
        ])->assertCreated()->assertJsonPath('data.name', 'Computer Science');
        $id = $program->json('data.id');

        $this->getJson('/api/v1/degree-programs?per_page=1')
            ->assertOk()->assertJsonStructure(['data', 'links', 'meta'])
            ->assertJsonPath('data.0.id', $id);

        $this->putJson("/api/v1/degree-programs/{$id}", ['name' => 'Computing'])
            ->assertOk()->assertJsonPath('data.name', 'Computing');
        $this->deleteJson("/api/v1/degree-programs/{$id}")->assertNoContent();
    }

    public function test_validation_rejects_invalid_grade_range_and_program_fields(): void
    {
        $this->postJson('/api/v1/degree-programs', ['name' => '', 'code' => ''])
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'code']);
        $this->postJson('/api/v1/grades', [
            'enrollment_id' => 999999,
            'subject_id' => 999999,
            'first_partial' => 101,
        ])->assertUnprocessable()->assertJsonValidationErrors(['enrollment_id', 'subject_id', 'first_partial']);
    }

    public function test_student_api_assigns_a_student_role_and_supports_record_updates(): void
    {
        $created = $this->postJson('/api/v1/students', [
            'name' => 'Jordan Student',
            'email' => 'jordan.'.uniqid().'@example.test',
            'password' => 'Strong-student-password-123',
            'student_number' => 'STU-'.uniqid(),
        ])->assertCreated()->assertJsonPath('data.role_id', Role::where('name', 'Student')->firstOrFail()->id);

        $studentId = $created->json('data.id');
        $this->patchJson("/api/v1/students/{$studentId}", ['name' => 'Jordan Updated'])
            ->assertOk()->assertJsonPath('data.name', 'Jordan Updated');
        $this->deleteJson("/api/v1/students/{$studentId}")->assertNoContent();
    }

    public function test_student_profile_fields_are_returned_without_sensitive_attributes(): void
    {
        $created = $this->postJson('/api/v1/students', [
            'first_name' => 'Taylor',
            'last_name' => 'Morgan',
            'email' => 'taylor.'.uniqid().'@example.test',
            'password' => 'Strong-student-password-123',
            'status' => 'active',
        ])->assertCreated()
            ->assertJsonPath('data.first_name', 'Taylor')
            ->assertJsonPath('data.last_name', 'Morgan')
            ->assertJsonPath('data.name', 'Taylor Morgan')
            ->assertJsonPath('data.status', 'active')
            ->assertJsonMissingPath('data.password');

        $studentId = $created->json('data.id');
        $this->patchJson("/api/v1/students/{$studentId}", ['first_name' => 'Taylor-Rose'])
            ->assertOk()
            ->assertJsonPath('data.first_name', 'Taylor-Rose')
            ->assertJsonPath('data.name', 'Taylor-Rose Morgan');
    }

    public function test_authenticated_collection_endpoints_return_paginated_json(): void
    {
        foreach ([
            'roles',
            'users',
            'degree-programs',
            'subjects',
            'academic-groups',
            'students',
            'teachers',
            'enrollments',
            'grades',
            'requests',
            'documents',
            'reports/students',
            'reports/teachers',
            'reports/grades',
            'reports/academic-groups',
        ] as $path) {
            $this->getJson('/api/v1/'.$path)
                ->assertOk()
                ->assertJsonStructure(['data', 'links', 'meta']);
        }
    }

    public function test_teacher_crud_assigns_teacher_role(): void
    {
        $created = $this->postJson('/api/v1/teachers', [
            'first_name' => 'Casey',
            'last_name' => 'Reed',
            'email' => 'casey.'.uniqid().'@example.test',
            'password' => 'Strong-teacher-password-123',
            'employee_number' => 'EMP-'.uniqid(),
        ])->assertCreated()
            ->assertJsonPath('data.first_name', 'Casey')
            ->assertJsonPath('data.role_id', Role::where('name', 'Teacher')->firstOrFail()->id);

        $teacherId = $created->json('data.id');
        $this->patchJson("/api/v1/teachers/{$teacherId}", ['last_name' => 'Morgan'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Casey Morgan');
        $this->deleteJson("/api/v1/teachers/{$teacherId}")->assertNoContent();
    }
}
