<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamAnalysis extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'course_id', 'new_question', 'syllabus_snapshot', 'similarity_score', 'syllabus_coverage_score', 'matching_questions', 'risk_flags', 'overall_verdict'];
    protected function casts(): array { return ['matching_questions' => 'array', 'risk_flags' => 'array']; }
    public function user() { return $this->belongsTo(User::class); }
    public function course() { return $this->belongsTo(Course::class); }
}
