<?php

namespace App\Policies;

use App\Models\AcademicGroup;
use App\Models\CampusRequest;
use App\Models\Document;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Role;
use App\Models\User;

class CampusPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, object $record): bool
    {
        if ($user->canManageAcademicRecords()) {
            return true;
        }
        if ($record instanceof User) {
            return $record->is($user);
        }
        if ($record instanceof Document || $record instanceof CampusRequest) {
            return $record->user_id === $user->id;
        }
        if ($record instanceof Enrollment) {
            return $record->student_id === $user->id || $record->academicGroup?->teacher_id === $user->id;
        }
        if ($record instanceof Grade) {
            return $record->enrollment?->student_id === $user->id
                || $record->enrollment?->academicGroup?->teacher_id === $user->id;
        }
        if ($record instanceof AcademicGroup) {
            return $record->teacher_id === $user->id || $user->academic_group_id === $record->id;
        }
        return true;
    }

    public function create(User $user): bool
    {
        return $user->canManageAcademicRecords();
    }

    public function update(User $user, object $record): bool
    {
        if ($record instanceof User) {
            return $record->is($user)
                || $user->isAdministrator()
                || ($user->hasRole('Department Head') && !$record->isAdministrator());
        }
        if ($record instanceof Role) {
            return $user->isAdministrator();
        }
        if ($record instanceof Document || $record instanceof CampusRequest) {
            return $record->user_id === $user->id || $user->canManageAcademicRecords();
        }
        if ($record instanceof Grade) {
            $group = $record->enrollment?->academicGroup;
            return $user->canManageAcademicRecords() || $group?->teacher_id === $user->id;
        }
        return $user->canManageAcademicRecords();
    }

    public function delete(User $user, object $record): bool
    {
        if ($record instanceof Document) {
            return $user->isAdministrator() || $record->user_id === $user->id;
        }
        if ($record instanceof Role) {
            return $user->isAdministrator();
        }
        if ($record instanceof User && $record->isAdministrator()) {
            return $user->isAdministrator();
        }
        return $user->canManageAcademicRecords();
    }
}
