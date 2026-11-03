<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCampusRecordRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return $this->recordRules(false);
    }

    protected function recordRules(bool $updating): array
    {
        $resource = explode('.', (string) $this->route()?->getName())[1] ?? '';
        $required = $updating ? 'sometimes' : 'required';
        $rules = [
            'roles' => ['name' => [$required, 'string', 'max:100', Rule::unique('roles', 'name')->ignore($this->route('role'))]],
            'users' => [
                'name' => ['sometimes', 'required_without_all:first_name,last_name', 'string', 'max:255'],
                'first_name' => [$updating ? 'sometimes' : 'required_without:name', 'string', 'max:120'],
                'last_name' => [$updating ? 'sometimes' : 'required_without:name', 'string', 'max:120'],
                'email' => [$required, 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user'))],
                'password' => [$updating ? 'sometimes' : 'required', 'string', 'min:12'],
                'role_id' => ['sometimes', 'integer', 'exists:roles,id'],
                'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
                'degree_program_id' => ['sometimes', 'nullable', 'integer', 'exists:degree_programs,id'],
                'academic_group_id' => ['sometimes', 'nullable', 'integer', 'exists:academic_groups,id'],
                'student_number' => ['sometimes', 'nullable', 'string', 'max:100'],
                'employee_number' => ['sometimes', 'nullable', 'string', 'max:100'],
                'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            ],
            'students' => [
                'name' => ['sometimes', 'required_without_all:first_name,last_name', 'string', 'max:255'],
                'first_name' => [$updating ? 'sometimes' : 'required_without:name', 'string', 'max:120'],
                'last_name' => [$updating ? 'sometimes' : 'required_without:name', 'string', 'max:120'],
                'email' => [$required, 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('student'))],
                'password' => [$updating ? 'sometimes' : 'required', 'string', 'min:12'],
                'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
                'degree_program_id' => ['sometimes', 'nullable', 'integer', 'exists:degree_programs,id'],
                'academic_group_id' => ['sometimes', 'nullable', 'integer', 'exists:academic_groups,id'],
                'student_number' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('users', 'student_number')->ignore($this->route('student'))], 'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            ],
            'teachers' => [
                'name' => ['sometimes', 'required_without_all:first_name,last_name', 'string', 'max:255'],
                'first_name' => [$updating ? 'sometimes' : 'required_without:name', 'string', 'max:120'],
                'last_name' => [$updating ? 'sometimes' : 'required_without:name', 'string', 'max:120'],
                'email' => [$required, 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('teacher'))],
                'password' => [$updating ? 'sometimes' : 'required', 'string', 'min:12'],
                'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
                'employee_number' => ['sometimes', 'nullable', 'string', 'max:100', Rule::unique('users', 'employee_number')->ignore($this->route('teacher'))], 'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            ],
            'degree-programs' => [
                'name' => [$required, 'string', 'max:255'], 'code' => [$required, 'string', 'max:50', Rule::unique('degree_programs', 'code')->ignore($this->route('degree_program'))],
                'description' => ['sometimes', 'nullable', 'string'],
            ],
            'subjects' => [
                'name' => [$required, 'string', 'max:255'], 'code' => [$required, 'string', 'max:50', Rule::unique('subjects', 'code')->ignore($this->route('subject'))],
                'description' => ['sometimes', 'nullable', 'string'], 'credits' => ['sometimes', 'integer', 'between:1,60'],
            ],
            'academic-groups' => [
                'name' => [$required, 'string', 'max:255'], 'degree_program_id' => [$required, 'integer', 'exists:degree_programs,id'],
                'teacher_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
                'academic_year' => [$required, 'string', 'max:20'], 'semester' => [$required, 'string', 'max:30'],
            ],
            'enrollments' => [
                'student_id' => [$required, 'integer', 'exists:users,id'], 'academic_group_id' => [$required, 'integer', 'exists:academic_groups,id'],
                'status' => ['sometimes', Rule::in(['active', 'withdrawn', 'completed'])], 'enrolled_at' => ['sometimes', 'nullable', 'date'],
            ],
            'grades' => [
                'enrollment_id' => [$required, 'integer', 'exists:enrollments,id'], 'subject_id' => [$required, 'integer', 'exists:subjects,id'],
                'first_partial' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
                'second_partial' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
                'third_partial' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
                'final_grade' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
            ],
            'requests' => [
                'type' => [$required, 'string', 'max:100'], 'title' => [$required, 'string', 'max:255'],
                'description' => ['sometimes', 'nullable', 'string'],
            ],
        ];
        return $rules[$resource] ?? [];
    }
}
