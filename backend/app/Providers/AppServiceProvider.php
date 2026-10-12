<?php

namespace App\Providers;

use App\Models\AcademicGroup;
use App\Models\CampusRequest;
use App\Models\DegreeProgram;
use App\Models\Document;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use App\Policies\CampusPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach ([AcademicGroup::class, CampusRequest::class, DegreeProgram::class, Document::class, Enrollment::class, Grade::class, Role::class, Subject::class, User::class] as $model) {
            Gate::policy($model, CampusPolicy::class);
        }
        // SECURITY_EXTENSION_POINT: Add MFA, RBAC hardening, audit, encryption, OWASP controls, and monitoring.
    }
}
