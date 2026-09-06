<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\ExamAnalysis;
use App\Models\SyllabusAnalysis;
use App\Services\AIAnalysisService;
use Illuminate\Http\Request;

class FacultyChatController extends Controller
{
    public function __invoke(Request $request, AIAnalysisService $ai)
    {
        $data = $request->validate(['message' => 'required|string|min:2|max:2000']);
        $userId = $request->user()->id;
        $courses = Course::where('user_id', $userId)->with('pastPapers')->orderBy('code')->get();
        $examAnalyses = ExamAnalysis::where('user_id', $userId)->with('course')->latest()->limit(5)->get();
        $syllabusAnalyses = SyllabusAnalysis::where('user_id', $userId)->with(['courseA', 'courseB'])->latest()->limit(5)->get();

        $courseContext = $courses->map(function ($course) {
            $pastPapers = $course->pastPapers->map(fn ($paper) => $paper->year.' '.$paper->term.': '.$paper->question_text)->implode("\n");
            return "COURSE {$course->code} - {$course->name}\nSYLLABUS: {$course->syllabus_raw}\nPAST PAPERS:\n".($pastPapers ?: 'None recorded.');
        })->implode("\n\n---\n\n");
        $examContext = $examAnalyses->map(fn ($analysis) => "{$analysis->course?->code}: {$analysis->overall_verdict}, similarity {$analysis->similarity_score}%, coverage {$analysis->syllabus_coverage_score}%, question: {$analysis->new_question}")->implode("\n");
        $syllabusContext = $syllabusAnalyses->map(fn ($analysis) => "{$analysis->courseA?->code} vs {$analysis->courseB?->code}: {$analysis->strategic_advice}")->implode("\n");
        $context = "FACULTY COURSE DATABASE:\n{$courseContext}\n\nRECENT EXAM ANALYSES:\n".($examContext ?: 'None recorded.')."\n\nRECENT SYLLABUS ANALYSES:\n".($syllabusContext ?: 'None recorded.');

        return response()->json(['reply' => $ai->chat($data['message'], $context)]);
    }
}