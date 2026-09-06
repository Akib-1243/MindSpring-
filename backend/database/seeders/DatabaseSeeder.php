<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\PastPaper;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(['email' => 'faculty@relavanet.edu'], ['name' => 'Dr. Amara Okafor', 'department' => 'Academic Quality', 'password' => Hash::make('relavanet-demo')]);
        $course = Course::firstOrCreate(['code' => 'CS401'], ['user_id' => $user->id, 'name' => 'Responsible Artificial Intelligence', 'syllabus_raw' => 'Machine learning foundations, model evaluation, fairness, explainability, governance, and applied case studies.']);
        PastPaper::firstOrCreate(['course_id' => $course->id, 'year' => '2024'], ['term' => 'Spring', 'question_text' => 'Evaluate the trade-offs between model accuracy and fairness in a high-stakes application.']);
        PastPaper::firstOrCreate(['course_id' => $course->id, 'year' => '2025'], ['term' => 'Fall', 'question_text' => 'Design an evaluation plan for an explainable machine learning system.']);
    }
}
