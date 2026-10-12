<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    public function definition(): array
    {
        $first = fake()->randomFloat(2, 60, 100);
        $second = fake()->randomFloat(2, 60, 100);
        $third = fake()->randomFloat(2, 60, 100);
        $final = fake()->randomFloat(2, 60, 100);

        return [
            'enrollment_id' => Enrollment::factory(),
            'subject_id' => Subject::factory(),
            'first_partial' => $first,
            'second_partial' => $second,
            'third_partial' => $third,
            'final_grade' => $final,
            'average_grade' => round(($first + $second + $third + $final) / 4, 2),
        ];
    }
}
