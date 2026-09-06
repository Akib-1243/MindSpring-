<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('question_bank', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('question_code')->nullable();
            $table->longText('question_text');
            $table->string('topic')->nullable();
            $table->string('difficulty')->default('medium');
            $table->string('question_type')->default('descriptive');
            $table->unsignedSmallInteger('marks')->nullable();
            $table->unsignedSmallInteger('estimated_coverage_percent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_bank');
    }
};
