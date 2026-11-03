<?php
namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreCampusRecordRequest;
use App\Http\Requests\UpdateCampusRecordRequest;
use App\Http\Resources\CampusResource;
use App\Models\Role;
use App\Models\User;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends CampusResourceController
{
    protected const MODEL = User::class;

    public function show(Request $request, string $id): CampusResource
    {
        $role = Role::where('name', 'Teacher')->firstOrFail();
        $record = User::whereKey($id)->where('role_id', $role->id)->firstOrFail();
        $this->authorize('view', $record);
        return new CampusResource($record);
    }

    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        abort_unless($request->user()->canManageAcademicRecords(), 403);
        $role = Role::where('name', 'Teacher')->firstOrFail();
        $query = User::where('role_id', $role->id);
        if ($request->filled('search')) {
            $query->where(fn ($builder) => $builder->where('name', 'like', '%'.$request->input('search').'%')
                ->orWhere('email', 'like', '%'.$request->input('search').'%'));
        }
        return CampusResource::collection($query->latest('id')->paginate(min(max((int) $request->input('per_page', 15), 1), 100)));
    }

    public function store(StoreCampusRecordRequest $request, GradeService $grades): \Illuminate\Http\JsonResponse
    {
        abort_unless($request->user()->canManageAcademicRecords(), 403);
        $role = Role::where('name', 'Teacher')->firstOrFail();
        $record = User::create([...$request->validated(), 'role_id' => $role->id]);
        return (new CampusResource($record))->response()->setStatusCode(201);
    }

    public function update(UpdateCampusRecordRequest $request, string $id, GradeService $grades): CampusResource
    {
        $record = User::findOrFail($id);
        abort_unless($record->hasRole('Teacher'), 404);
        $this->authorize('update', $record);
        $attributes = $request->validated();
        unset($attributes['role_id'], $attributes['student_number'], $attributes['degree_program_id'], $attributes['academic_group_id']);
        if (isset($attributes['password'])) {
            $attributes['password'] = Hash::make($attributes['password']);
        }
        $record->update($attributes);
        return new CampusResource($record->refresh());
    }

    public function destroy(Request $request, string $id): \Illuminate\Http\Response
    {
        $role = Role::where('name', 'Teacher')->firstOrFail();
        $record = User::whereKey($id)->where('role_id', $role->id)->firstOrFail();
        $this->authorize('delete', $record);
        $record->delete();
        return response()->noContent();
    }
}
