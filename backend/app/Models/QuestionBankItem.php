<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuestionBankItem extends Model
{
    use HasFactory;

    protected $table = 'question_bank';
    protected $fillable = ['course_id', 'question_code', 'question_text', 'topic', 'difficulty', 'question_type', 'marks', 'estimated_coverage_percent'];
    protected function casts(): array { return ['marks' => 'integer', 'estimated_coverage_percent' => 'integer']; }
    public function course() { return $this->belongsTo(Course::class); }
}
