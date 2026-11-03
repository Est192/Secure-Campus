<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'first_name', 'last_name', 'email', 'password', 'role_id', 'status', 'degree_program_id',
        'academic_group_id', 'student_number', 'employee_number', 'phone',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed'];
    }

    protected static function booted(): void
    {
        static::saving(function (User $user): void {
            if ($user->isDirty(['first_name', 'last_name'])) {
                $user->name = trim(implode(' ', array_filter([
                    $user->first_name,
                    $user->last_name,
                ], fn (?string $part): bool => $part !== null && $part !== '')));
            } elseif ($user->isDirty('name')) {
                $parts = preg_split('/\s+/', trim((string) $user->name), 2) ?: [];
                $user->first_name = $parts[0] ?? '';
                $user->last_name = $parts[1] ?? '';
            }
        });
    }

    public function role(): BelongsTo { return $this->belongsTo(Role::class); }
    public function degreeProgram(): BelongsTo { return $this->belongsTo(DegreeProgram::class); }
    public function academicGroup(): BelongsTo { return $this->belongsTo(AcademicGroup::class); }
    public function enrollments(): HasMany { return $this->hasMany(Enrollment::class, 'student_id'); }
    public function documents(): HasMany { return $this->hasMany(Document::class); }
    public function requests(): HasMany { return $this->hasMany(CampusRequest::class, 'user_id'); }

    public function hasRole(string ...$roles): bool
    {
        return $this->role !== null && in_array($this->role->name, $roles, true);
    }

    public function isAdministrator(): bool
    {
        return $this->hasRole('Administrator');
    }

    public function canManageAcademicRecords(): bool
    {
        return $this->hasRole('Administrator', 'Department Head');
    }
}
