<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('syllabus_analyses', function (Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->foreignId('course_a_id')->constrained('courses')->cascadeOnDelete(); $table->foreignId('course_b_id')->constrained('courses')->cascadeOnDelete(); $table->json('overlaps'); $table->json('unique_to_a'); $table->json('unique_to_b'); $table->text('strategic_advice'); $table->timestamps(); }); }
    public function down(): void { Schema::dropIfExists('syllabus_analyses'); }
};
