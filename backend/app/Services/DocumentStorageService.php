<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentStorageService
{
    public function store(User $owner, UploadedFile $file, string $title, ?string $category = null): Document
    {
        $disk = 'local';
        $path = $file->store('documents/'.$owner->getKey(), $disk);
        return Document::create([
            'user_id' => $owner->getKey(),
            'title' => $title,
            'category' => $category,
            'disk' => $disk,
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'metadata' => ['original_name' => $file->getClientOriginalName()],
        ]);
    }

    public function delete(Document $document): void
    {
        Storage::disk($document->disk)->delete($document->path);
        $document->delete();
    }
}
