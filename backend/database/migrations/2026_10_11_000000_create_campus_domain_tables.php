<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table): void {
                $table->id();
                $table->string('name')->unique();
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('degree_programs')) {
            Schema::create('degree_programs', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
        if (!Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->foreignId('role_id')->nullable()->constrained()->nullOnDelete();
            });
        }
        if (!Schema::hasColumn('users', 'degree_program_id')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->foreignId('degree_program_id')->nullable()->constrained()->nullOnDelete();
            });
        }
        if (!Schema::hasColumn('users', 'academic_group_id')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->unsignedBigInteger('academic_group_id')->nullable();
            });
        }
        if (!Schema::hasColumn('users', 'student_number')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->string('student_number')->nullable()->unique();
            });
        }
        if (!Schema::hasColumn('users', 'employee_number')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->string('employee_number')->nullable()->unique();
            });
        }
        if (!Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table): void {
                $table->string('phone')->nullable();
            });
        }
        if (!Schema::hasTable('academic_groups')) {
            Schema::create('academic_groups', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->foreignId('degree_program_id')->constrained()->cascadeOnDelete();
                $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('academic_year');
                $table->string('semester');
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('subjects')) {
            Schema::create('subjects', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->text('description')->nullable();
                $table->unsignedTinyInteger('credits')->default(1);
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('enrollments')) {
            Schema::create('enrollments', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('academic_group_id')->constrained()->cascadeOnDelete();
                $table->string('status')->default('active');
                $table->date('enrolled_at')->nullable();
                $table->timestamps();
                $table->unique(['student_id', 'academic_group_id']);
            });
        }
        if (!Schema::hasTable('grades')) {
            Schema::create('grades', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
                $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
                $table->decimal('first_partial', 5, 2)->nullable();
                $table->decimal('second_partial', 5, 2)->nullable();
                $table->decimal('third_partial', 5, 2)->nullable();
                $table->decimal('final_grade', 5, 2)->nullable();
                $table->decimal('average_grade', 5, 2)->nullable();
                $table->timestamps();
                $table->unique(['enrollment_id', 'subject_id']);
            });
        }
        if (!Schema::hasTable('documents')) {
            Schema::create('documents', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->string('title');
                $table->string('category')->nullable();
                $table->string('disk')->default('local');
                $table->string('path');
                $table->string('mime_type')->nullable();
                $table->unsignedBigInteger('size')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('requests')) {
            Schema::create('requests', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('type');
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('status')->default('Pending');
                $table->text('review_notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('academic_groups');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['role_id', 'degree_program_id', 'academic_group_id', 'student_number', 'employee_number', 'phone']);
        });
        Schema::dropIfExists('degree_programs');
        Schema::dropIfExists('roles');
    }
};
