<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamAnalysis extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'course_id', 'new_question', 'syllabus_snapshot', 'similarity_score', 'syllabus_coverage_score', 'question_bank_similarity_score', 'question_bank_coverage_score', 'matching_questions', 'question_bank_matches', 'covered_topics', 'uncovered_topics', 'risk_flags', 'overall_verdict', 'analysis_summary'];
    protected function casts(): array { return ['matching_questions' => 'array', 'question_bank_matches' => 'array', 'covered_topics' => 'array', 'uncovered_topics' => 'array', 'risk_flags' => 'array']; }
    public function user() { return $this->belongsTo(User::class); }
    public function course() { return $this->belongsTo(Course::class); }
}
