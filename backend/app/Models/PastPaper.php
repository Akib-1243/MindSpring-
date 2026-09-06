<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PastPaper extends Model
{
    use HasFactory;
    protected $fillable = ['course_id', 'year', 'term', 'question_text'];
    public function course() { return $this->belongsTo(Course::class); }
}
