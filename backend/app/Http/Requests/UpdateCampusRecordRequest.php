<?php

namespace App\Http\Requests;

class UpdateCampusRecordRequest extends StoreCampusRecordRequest
{
    public function rules(): array
    {
        return $this->recordRules(true);
    }
}
