<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampusRecordRequest;
use App\Http\Requests\UpdateCampusRecordRequest;
use App\Http\Resources\CampusResource;
use App\Models\CampusRequest;
use App\Services\RequestStatusService;
use Illuminate\Http\Request;

class CampusRequestController extends Controller
{
    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $this->authorize('viewAny', CampusRequest::class);
        $query = CampusRequest::query();
        if (!$request->user()->canManageAcademicRecords()) {
            $query->where('user_id', $request->user()->id);
        } elseif ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        return CampusResource::collection($query->latest('id')->paginate(min(max((int) $request->input('per_page', 15), 1), 100)));
    }

    public function store(StoreCampusRecordRequest $request): \Illuminate\Http\JsonResponse
    {
        return (new CampusResource(CampusRequest::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'Pending',
        ])))->response()->setStatusCode(201);
    }

    public function show(string $id): CampusResource
    {
        $record = CampusRequest::findOrFail($id);
        $this->authorize('view', $record);
        return new CampusResource($record);
    }

    public function update(UpdateCampusRecordRequest $request, string $id): CampusResource
    {
        $record = CampusRequest::findOrFail($id);
        $this->authorize('update', $record);
        abort_unless($record->user_id === $request->user()->id && $record->status === 'Pending', 403);
        $record->update($request->validated());
        return new CampusResource($record->refresh());
    }

    public function transition(Request $request, string $id, RequestStatusService $transitions): CampusResource
    {
        $this->authorize('update', CampusRequest::findOrFail($id));
        abort_unless($request->user()->canManageAcademicRecords(), 403);
        $data = $request->validate([
            'status' => ['required', 'in:Under Review,Approved,Rejected'],
            'review_notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);
        $record = $transitions->transition(CampusRequest::findOrFail($id), $data['status'], $data['review_notes'] ?? null);
        return new CampusResource($record);
    }

    public function destroy(Request $request, string $id): \Illuminate\Http\Response
    {
        $record = CampusRequest::findOrFail($id);
        $this->authorize('delete', $record);
        $record->delete();
        return response()->noContent();
    }
}
