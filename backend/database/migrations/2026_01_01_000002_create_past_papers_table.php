<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('past_papers', function (Blueprint $table) { $table->id(); $table->foreignId('course_id')->constrained()->cascadeOnDelete(); $table->string('year'); $table->string('term')->nullable(); $table->longText('question_text'); $table->timestamps(); }); }
    public function down(): void { Schema::dropIfExists('past_papers'); }
};
