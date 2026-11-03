<?php

namespace Database\Factories;

use App\Models\DegreeProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicGroupFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'degree_program_id' => DegreeProgram::factory(),
            'teacher_id' => null,
            'academic_year' => '2026-2027',
            'semester' => fake()->randomElement(['Fall', 'Spring', 'Summer']),
        ];
    }
}
