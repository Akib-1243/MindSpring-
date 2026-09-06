<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\SyllabusAnalysis;
use App\Services\AIAnalysisService;

class SyllabusAnalysisController extends Controller
{
    public function analyze(Request $request, AIAnalysisService $ai)
    {
        $data = $request->validate(['course_a_id' => 'required|exists:courses,id|different:course_b_id', 'course_b_id' => 'required|exists:courses,id']);
        $courses = Course::whereIn('id', [$data['course_a_id'], $data['course_b_id']])->get()->keyBy('id');
        abort_if($courses->count() !== 2, 403);
        $result = $ai->analyzeSyllabusOverlap($courses[$data['course_a_id']]->syllabus_raw, $courses[$data['course_b_id']]->syllabus_raw);
        $analysis = SyllabusAnalysis::create(['user_id' => $request->user()->id, 'course_a_id' => $data['course_a_id'], 'course_b_id' => $data['course_b_id'], 'overlaps' => $result['overlaps'] ?? [], 'unique_to_a' => $result['unique_to_a'] ?? [], 'unique_to_b' => $result['unique_to_b'] ?? [], 'strategic_advice' => $result['strategic_advice'] ?? '']);
        return response()->json($analysis->load(['courseA', 'courseB']), 201);
    }
}
