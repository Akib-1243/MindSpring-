<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('exam_analyses', function (Blueprint $table) {
            $table->unsignedTinyInteger('question_bank_similarity_score')->default(0)->after('syllabus_coverage_score');
            $table->unsignedTinyInteger('question_bank_coverage_score')->default(0)->after('question_bank_similarity_score');
            $table->json('question_bank_matches')->nullable()->after('matching_questions');
            $table->json('covered_topics')->nullable()->after('question_bank_matches');
            $table->json('uncovered_topics')->nullable()->after('covered_topics');
            $table->text('analysis_summary')->nullable()->after('overall_verdict');
        });
    }

    public function down(): void
    {
        Schema::table('exam_analyses', function (Blueprint $table) {
            $table->dropColumn(['question_bank_similarity_score', 'question_bank_coverage_score', 'question_bank_matches', 'covered_topics', 'uncovered_topics', 'analysis_summary']);
        });
    }
};
