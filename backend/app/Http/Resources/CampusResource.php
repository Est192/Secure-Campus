<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attributes = parent::toArray($request);
        unset($attributes['password'], $attributes['remember_token']);
        return $attributes;
    }
}
