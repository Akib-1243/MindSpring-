<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\ExamAnalysis;
use App\Services\AIAnalysisService;

class ExamForensicController extends Controller
{
    public function analyze(Request $request, AIAnalysisService $ai)
    {
        $data = $request->validate(['course_id' => 'required|exists:courses,id', 'new_question' => 'required|string|min:10']);
        $course = Course::where('id', $data['course_id'])->where('user_id', $request->user()->id)->with('pastPapers')->firstOrFail();
        $pastPapers = $course->pastPapers->map(fn ($paper) => $paper->year.': '.$paper->question_text)->implode("\n---\n");
        $result = $ai->analyzeExamForensic($data['new_question'], $pastPapers, $course->syllabus_raw);
        $analysis = ExamAnalysis::create(['user_id' => $request->user()->id, 'course_id' => $course->id, 'new_question' => $data['new_question'], 'syllabus_snapshot' => $course->syllabus_raw, 'similarity_score' => min(100, max(0, (int) ($result['similarity_score'] ?? 0))), 'syllabus_coverage_score' => min(100, max(0, (int) ($result['syllabus_coverage_score'] ?? 0))), 'matching_questions' => $result['matching_previous_questions'] ?? [], 'risk_flags' => $result['risk_flags'] ?? [], 'overall_verdict' => $result['overall_verdict'] ?? 'Needs Review']);
        return response()->json($analysis->load('course'), 201);
    }
}
