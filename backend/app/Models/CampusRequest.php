<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampusRequest extends Model
{
    use HasFactory;

    protected $table = 'requests';
    protected $fillable = ['user_id', 'type', 'title', 'description', 'status', 'review_notes'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
