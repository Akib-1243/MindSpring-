<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'department', 'role'];
    protected $hidden = ['password', 'remember_token'];
    protected function casts(): array { return ['email_verified_at' => 'datetime', 'password' => 'hashed']; }
    public function courses() { return $this->hasMany(Course::class); }
    public function syllabusAnalyses() { return $this->hasMany(SyllabusAnalysis::class); }
    public function examAnalyses() { return $this->hasMany(ExamAnalysis::class); }
    public function isAdmin(): bool { return $this->role === 'admin'; }
}
