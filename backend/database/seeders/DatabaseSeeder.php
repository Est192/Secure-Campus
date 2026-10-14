<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Administrator', 'Teacher', 'Department Head', 'Student'] as $name) {
            Role::firstOrCreate(['name' => $name]);
        }

        $email = env('BOOTSTRAP_ADMIN_EMAIL');
        $password = env('BOOTSTRAP_ADMIN_PASSWORD');
        if ($email !== null || $password !== null) {
            if (!is_string($email) || $email === '' || !is_string($password) || strlen($password) < 12) {
                throw new RuntimeException('Bootstrap admin requires BOOTSTRAP_ADMIN_EMAIL and a password of at least 12 characters.');
            }
            $role = Role::where('name', 'Administrator')->firstOrFail();
            User::updateOrCreate(
                ['email' => $email],
                ['name' => 'Administrator', 'password' => Hash::make($password), 'role_id' => $role->id]
            );
        }
    }
}
