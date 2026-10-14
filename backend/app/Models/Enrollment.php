<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'academic_group_id', 'status', 'enrolled_at'];
    protected function casts(): array { return ['enrolled_at' => 'date']; }
    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
    public function academicGroup(): BelongsTo { return $this->belongsTo(AcademicGroup::class); }
    public function grades(): HasMany { return $this->hasMany(Grade::class); }
}
