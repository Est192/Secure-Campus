<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_login_issues_a_sanctum_token_and_logout_revokes_it(): void
    {
        $role = Role::firstOrCreate(['name' => 'Administrator']);
        $user = User::factory()->create(['role_id' => $role->id, 'password' => 'Strong-test-password-123']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Strong-test-password-123',
            'device_name' => 'feature-test',
        ])->assertOk()->assertJsonPath('data.id', $user->id)->assertJsonPath('token_type', 'Bearer');

        $token = $response->json('token');
        $this->withToken($token)->getJson('/api/v1/roles')->assertOk();
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', ['token' => hash('sha256', $token)]);
    }

    public function test_management_routes_require_authentication(): void
    {
        $this->getJson('/api/v1/degree-programs')->assertUnauthorized();
        $this->postJson('/api/v1/subjects', [])->assertUnauthorized();
        $this->get('/api/v1/students')->assertUnauthorized();
    }
}
