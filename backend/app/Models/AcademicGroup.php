<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicGroup extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'degree_program_id', 'teacher_id', 'academic_year', 'semester'];
    public function degreeProgram(): BelongsTo { return $this->belongsTo(DegreeProgram::class); }
    public function teacher(): BelongsTo { return $this->belongsTo(User::class, 'teacher_id'); }
    public function enrollments(): HasMany { return $this->hasMany(Enrollment::class); }
}
