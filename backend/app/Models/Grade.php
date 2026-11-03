<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id', 'subject_id', 'first_partial', 'second_partial',
        'third_partial', 'final_grade', 'average_grade',
    ];
    protected function casts(): array
    {
        return array_fill_keys(
            ['first_partial', 'second_partial', 'third_partial', 'final_grade', 'average_grade'],
            'decimal:2'
        );
    }
    public function enrollment(): BelongsTo { return $this->belongsTo(Enrollment::class); }
    public function subject(): BelongsTo { return $this->belongsTo(Subject::class); }
}
