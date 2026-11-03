<?php

namespace App\Services;

use App\Models\Grade;

class GradeService
{
    public function save(array $attributes, ?Grade $grade = null): Grade
    {
        $grade ??= new Grade();
        $values = array_intersect_key($attributes, array_flip([
            'enrollment_id', 'subject_id', 'first_partial', 'second_partial', 'third_partial', 'final_grade',
        ]));
        foreach (['first_partial', 'second_partial', 'third_partial'] as $partial) {
            if (array_key_exists($partial, $values)) {
                $grade->{$partial} = $values[$partial];
            }
        }
        if (array_key_exists('final_grade', $values)) {
            $grade->final_grade = $values['final_grade'];
        }
        foreach (['enrollment_id', 'subject_id'] as $key) {
            if (array_key_exists($key, $values)) {
                $grade->{$key} = $values[$key];
            }
        }
        $marks = array_filter(
            [$grade->first_partial, $grade->second_partial, $grade->third_partial, $grade->final_grade],
            static fn ($value): bool => $value !== null
        );
        $grade->average_grade = count($marks) ? round(array_sum($marks) / count($marks), 2) : null;
        $grade->save();
        return $grade;
    }
}
