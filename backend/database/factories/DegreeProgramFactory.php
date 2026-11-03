<?php

namespace Database\Factories;

use App\Models\DegreeProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

class DegreeProgramFactory extends Factory
{
    protected $model = DegreeProgram::class;
    public function definition(): array
    {
        return ['name' => fake()->words(2, true), 'code' => fake()->unique()->bothify('DP-###'), 'description' => fake()->sentence()];
    }
}
