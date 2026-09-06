<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'name', 'code', 'syllabus_raw'];
    public function user() { return $this->belongsTo(User::class); }
    public function pastPapers() { return $this->hasMany(PastPaper::class); }
    public function questionBank() { return $this->hasMany(QuestionBankItem::class); }
    public function syllabusAnalysesA() { return $this->hasMany(SyllabusAnalysis::class, 'course_a_id'); }
    public function syllabusAnalysesB() { return $this->hasMany(SyllabusAnalysis::class, 'course_b_id'); }
    public function examAnalyses() { return $this->hasMany(ExamAnalysis::class); }
}
