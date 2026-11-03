<?php

namespace Database\Factories;

use App\Models\AcademicGroup;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    public function definition(): array
    {
        $studentRole = Role::firstOrCreate(['name' => 'Student']);

        return [
            'student_id' => User::factory()->state(['role_id' => $studentRole->id]),
            'academic_group_id' => AcademicGroup::factory(),
            'status' => 'active',
            'enrolled_at' => fake()->date(),
        ];
    }
}
