<?php

use App\Http\Controllers\Api\AcademicGroupController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampusRequestController;
use App\Http\Controllers\Api\DegreeProgramController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::get('/health', function (): JsonResponse {
    return response()->json(['status' => 'ok']);
});

Route::prefix('v1')->name('api.')->group(function (): void {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('auth.login');
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

        Route::apiResource('roles', RoleController::class);
        Route::apiResource('users', UserController::class);
        Route::apiResource('degree-programs', DegreeProgramController::class);
        Route::apiResource('subjects', SubjectController::class);
        Route::apiResource('academic-groups', AcademicGroupController::class);
        Route::apiResource('students', StudentController::class);
        Route::apiResource('teachers', TeacherController::class);
        Route::apiResource('enrollments', EnrollmentController::class);
        Route::apiResource('grades', GradeController::class);
        Route::apiResource('requests', CampusRequestController::class);
        Route::patch('/requests/{id}/status', [CampusRequestController::class, 'transition'])->name('requests.transition');

        Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::get('/documents/{id}', [DocumentController::class, 'show'])->name('documents.show');
        Route::get('/documents/{id}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy'])->name('documents.destroy');

        Route::prefix('reports')->name('reports.')->group(function (): void {
            Route::get('/students', [ReportController::class, 'students'])->name('students');
            Route::get('/teachers', [ReportController::class, 'teachers'])->name('teachers');
            Route::get('/grades', [ReportController::class, 'grades'])->name('grades');
            Route::get('/academic-groups', [ReportController::class, 'academicGroups'])->name('academic-groups');
        });
    });
});
