<?php

namespace App\Services;

use App\Models\CampusRequest;
use Illuminate\Validation\ValidationException;

class RequestStatusService
{
    public function transition(CampusRequest $request, string $status, ?string $notes = null): CampusRequest
    {
        $transitions = [
            'Pending' => ['Under Review', 'Rejected'],
            'Under Review' => ['Approved', 'Rejected'],
            'Approved' => [],
            'Rejected' => [],
        ];
        if (!in_array($status, $transitions[$request->status] ?? [], true)) {
            throw ValidationException::withMessages(['status' => ['The requested status transition is not allowed.']]);
        }
        $request->status = $status;
        $request->review_notes = $notes;
        $request->save();
        return $request;
    }
}
