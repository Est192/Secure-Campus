<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CampusRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => 'Transcript',
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'status' => 'Pending',
            'review_notes' => null,
        ];
    }
}
