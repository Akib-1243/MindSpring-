<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SyllabusAnalysis extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'course_a_id', 'course_b_id', 'overlaps', 'unique_to_a', 'unique_to_b', 'strategic_advice'];
    protected function casts(): array { return ['overlaps' => 'array', 'unique_to_a' => 'array', 'unique_to_b' => 'array']; }
    public function user() { return $this->belongsTo(User::class); }
    public function courseA() { return $this->belongsTo(Course::class, 'course_a_id'); }
    public function courseB() { return $this->belongsTo(Course::class, 'course_b_id'); }
}
