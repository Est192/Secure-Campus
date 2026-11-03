<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadDocumentRequest;
use App\Http\Resources\CampusResource;
use App\Models\Document;
use App\Services\DocumentStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $this->authorize('viewAny', Document::class);
        $query = Document::query();
        if (!$request->user()->canManageAcademicRecords()) {
            $query->where('user_id', $request->user()->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }
        return CampusResource::collection($query->latest('id')->paginate(min(max((int) $request->input('per_page', 15), 1), 100)));
    }

    public function store(UploadDocumentRequest $request, DocumentStorageService $storage): \Illuminate\Http\JsonResponse
    {
        return (new CampusResource($storage->store(
            $request->user(),
            $request->file('file'),
            $request->validated('title'),
            $request->validated('category')
        )))->response()->setStatusCode(201);
    }

    public function show(string $id): CampusResource
    {
        $document = Document::findOrFail($id);
        $this->authorize('view', $document);
        return new CampusResource($document);
    }

    public function download(string $id)
    {
        $document = Document::findOrFail($id);
        $this->authorize('view', $document);
        abort_unless(Storage::disk($document->disk)->exists($document->path), 404);
        return Storage::disk($document->disk)->download($document->path, $document->metadata['original_name'] ?? basename($document->path));
    }

    public function destroy(string $id, DocumentStorageService $storage): \Illuminate\Http\Response
    {
        $document = Document::findOrFail($id);
        $this->authorize('delete', $document);
        $storage->delete($document);
        return response()->noContent();
    }
}
