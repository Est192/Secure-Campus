<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CampusResource;
use App\Models\AcademicGroup;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReportController extends Controller
{
    private function authorizeReport(Request $request): void
    {
        abort_unless($request->user()->canManageAcademicRecords(), 403);
    }

    private function paginate($query, Request $request): AnonymousResourceCollection
    {
        return CampusResource::collection($query->latest('id')->paginate(min(max((int) $request->input('per_page', 15), 1), 100)));
    }

    public function students(Request $request): AnonymousResourceCollection
    {
        $this->authorizeReport($request);
        $role = Role::where('name', 'Student')->firstOrFail();
        return $this->paginate(User::where('role_id', $role->id)->with(['degreeProgram', 'academicGroup']), $request);
    }

    public function teachers(Request $request): AnonymousResourceCollection
    {
        $this->authorizeReport($request);
        $role = Role::where('name', 'Teacher')->firstOrFail();
        return $this->paginate(User::where('role_id', $role->id), $request);
    }

    public function grades(Request $request): AnonymousResourceCollection
    {
        $this->authorizeReport($request);
        $query = Grade::with(['enrollment.student', 'enrollment.academicGroup', 'subject']);
        if ($request->filled('academic_group_id')) {
            $query->whereHas('enrollment', fn ($builder) => $builder->where('academic_group_id', $request->integer('academic_group_id')));
        }
        return $this->paginate($query, $request);
    }

    public function academicGroups(Request $request): AnonymousResourceCollection
    {
        $this->authorizeReport($request);
        return $this->paginate(AcademicGroup::with(['degreeProgram', 'teacher'])->withCount('enrollments'), $request);
    }
}
