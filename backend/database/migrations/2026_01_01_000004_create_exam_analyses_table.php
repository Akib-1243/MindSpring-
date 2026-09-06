<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('exam_analyses', function (Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->foreignId('course_id')->constrained()->cascadeOnDelete(); $table->longText('new_question'); $table->longText('syllabus_snapshot'); $table->unsignedTinyInteger('similarity_score'); $table->unsignedTinyInteger('syllabus_coverage_score'); $table->json('matching_questions'); $table->json('risk_flags'); $table->string('overall_verdict'); $table->timestamps(); }); }
    public function down(): void { Schema::dropIfExists('exam_analyses'); }
};
