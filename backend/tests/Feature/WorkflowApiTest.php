<?php

namespace Tests\Feature;

use App\Models\AcademicGroup;
use App\Models\DegreeProgram;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WorkflowApiTest extends TestCase
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

    public function test_grade_service_calculates_average_and_reports_are_paginated(): void
    {
        $studentRole = Role::firstOrCreate(['name' => 'Student']);
        $student = User::factory()->create(['role_id' => $studentRole->id]);
        $program = DegreeProgram::create(['name' => 'Engineering', 'code' => 'ENG-'.uniqid()]);
        $group = AcademicGroup::create([
            'name' => 'ENG 1', 'degree_program_id' => $program->id,
            'academic_year' => '2026-2027', 'semester' => 'Fall',
        ]);
        $enrollment = Enrollment::create(['student_id' => $student->id, 'academic_group_id' => $group->id]);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH-'.uniqid(), 'credits' => 3]);

        $grade = $this->postJson('/api/v1/grades', [
            'enrollment_id' => $enrollment->id,
            'subject_id' => $subject->id,
            'first_partial' => 80,
            'second_partial' => 90,
            'third_partial' => 100,
            'final_grade' => 90,
        ])->assertCreated()->assertJsonPath('data.average_grade', '90.00');

        $this->getJson('/api/v1/reports/grades?academic_group_id='.$group->id)
            ->assertOk()->assertJsonPath('data.0.id', $grade->json('data.id'))
            ->assertJsonStructure(['data', 'links', 'meta']);
        $this->getJson('/api/v1/reports/academic-groups')->assertOk()->assertJsonStructure(['data', 'links', 'meta']);
        $this->getJson('/api/v1/reports/students')->assertOk();
        $this->getJson('/api/v1/reports/teachers')->assertOk();
    }

    public function test_request_status_transitions_are_enforced_and_document_metadata_is_stored(): void
    {
        $request = $this->postJson('/api/v1/requests', ['type' => 'Transcript', 'title' => 'Transcript copy'])
            ->assertCreated()->assertJsonPath('data.status', 'Pending');
        $id = $request->json('data.id');
        $this->patchJson("/api/v1/requests/{$id}/status", ['status' => 'Under Review'])->assertOk();
        $this->patchJson("/api/v1/requests/{$id}/status", ['status' => 'Approved', 'review_notes' => 'Completed'])->assertOk()
            ->assertJsonPath('data.status', 'Approved');
        $this->patchJson("/api/v1/requests/{$id}/status", ['status' => 'Rejected'])->assertUnprocessable();

        Storage::fake('local');
        $response = $this->postJson('/api/v1/documents', [
            'title' => 'Enrollment proof',
            'category' => 'Student Records',
            'file' => UploadedFile::fake()->create('proof.pdf', 20, 'application/pdf'),
        ])->assertCreated()->assertJsonPath('data.title', 'Enrollment proof')
            ->assertJsonPath('data.mime_type', 'application/pdf');
        Storage::disk('local')->assertExists($response->json('data.path'));
        $this->getJson('/api/v1/documents/'.$response->json('data.id'))->assertOk()
            ->assertJsonPath('data.size', 20 * 1024);
    }
}
