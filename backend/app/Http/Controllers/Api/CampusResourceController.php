<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampusRecordRequest;
use App\Http\Requests\UpdateCampusRecordRequest;
use App\Http\Resources\CampusResource;
use App\Services\GradeService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Schema;

abstract class CampusResourceController extends Controller
{
    protected const MODEL = Model::class;

    public function index(Request $request): AnonymousResourceCollection
    {
        $model = static::MODEL;
        $this->authorize('viewAny', $model);
        $query = $model::query();
        if ($model === \App\Models\User::class && !$request->user()->canManageAcademicRecords()) {
            $query->whereKey($request->user()->id);
        }
        if ($model === \App\Models\Enrollment::class && !$request->user()->canManageAcademicRecords()) {
            $query->where(function ($builder) use ($request): void {
                $builder->where('student_id', $request->user()->id)
                    ->orWhereHas('academicGroup', fn ($groups) => $groups->where('teacher_id', $request->user()->id));
            });
        }
        if ($model === \App\Models\Grade::class && !$request->user()->canManageAcademicRecords()) {
            $query->whereHas('enrollment', function ($enrollments) use ($request): void {
                $enrollments->where('student_id', $request->user()->id)
                    ->orWhereHas('academicGroup', fn ($groups) => $groups->where('teacher_id', $request->user()->id));
            });
        }
        if ($model === \App\Models\AcademicGroup::class && !$request->user()->canManageAcademicRecords()) {
            $query->where(function ($groups) use ($request): void {
                $groups->where('teacher_id', $request->user()->id)
                    ->orWhereHas('enrollments', fn ($enrollments) => $enrollments->where('student_id', $request->user()->id));
            });
        }
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $modelClass = static::MODEL;
            $columns = array_values(array_filter(['name', 'code', 'email'], fn (string $column): bool => Schema::hasColumn((new $modelClass())->getTable(), $column)));
            if ($columns !== []) {
                $query->where(function ($builder) use ($search, $columns): void {
                    foreach ($columns as $index => $column) {
                        $method = $index === 0 ? 'where' : 'orWhere';
                        $builder->{$method}($column, 'like', "%{$search}%");
                    }
                });
            }
        }
        foreach (['status', 'degree_program_id', 'academic_group_id', 'student_id', 'subject_id'] as $filter) {
            if ($request->filled($filter) && in_array($filter, (new $model())->getFillable(), true)) {
                $query->where($filter, $request->input($filter));
            }
        }
        return CampusResource::collection($query->latest('id')->paginate(min(max((int) $request->input('per_page', 15), 1), 100)));
    }

    public function store(StoreCampusRecordRequest $request, GradeService $grades): \Illuminate\Http\JsonResponse
    {
        $model = static::MODEL;
        abort_unless(
            in_array($model, [\App\Models\User::class, \App\Models\Role::class], true)
                ? $request->user()->isAdministrator()
                : $request->user()->canManageAcademicRecords(),
            403
        );
        $attributes = $request->validated();
        $record = $model === \App\Models\Grade::class
            ? $grades->save($attributes)
            : $model::create($attributes);
        return (new CampusResource($record))->response()->setStatusCode(201);
    }

    public function show(Request $request, string $id): CampusResource
    {
        $model = static::MODEL;
        $record = $model::findOrFail($id);
        $this->authorize('view', $record);
        return new CampusResource($record);
    }

    public function update(UpdateCampusRecordRequest $request, string $id, GradeService $grades): CampusResource
    {
        $model = static::MODEL;
        $record = $model::findOrFail($id);
        $this->authorize('update', $record);
        $attributes = $request->validated();
        if ($record instanceof \App\Models\Grade) {
            $record = $grades->save($attributes, $record);
        } else {
            if ($record instanceof \App\Models\User && !$request->user()->isAdministrator()) {
                unset($attributes['role_id']);
            }
            $record->update(Arr::except($attributes, ['password']));
            if (isset($attributes['password'])) {
                $record->password = $attributes['password'];
                $record->save();
            }
        }
        return new CampusResource($record->refresh());
    }

    public function destroy(Request $request, string $id): \Illuminate\Http\Response
    {
        $model = static::MODEL;
        $record = $model::findOrFail($id);
        $this->authorize('delete', $record);
        $record->delete();
        return response()->noContent();
    }
}
