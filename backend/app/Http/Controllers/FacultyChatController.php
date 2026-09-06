<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\User;
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
        $courses = Course::with(['department', 'pastPapers', 'questionBank'])->orderBy('code')->get();
        $departments = Department::orderBy('code')->get();
        $faculty = User::where('role', 'faculty')->orderBy('name')->get(['name', 'email', 'department']);
        $examAnalyses = ExamAnalysis::with('course')->latest()->limit(20)->get();
        $syllabusAnalyses = SyllabusAnalysis::with(['courseA', 'courseB'])->latest()->limit(20)->get();

        $courseContext = $courses->map(function ($course) {
            $pastPapers = $course->pastPapers->map(fn ($paper) => $paper->year.' '.$paper->term.': '.$paper->question_text)->implode("\n");
            $questionBank = $course->questionBank->map(fn ($item) => "{$item->question_code} | {$item->topic} | {$item->difficulty} | {$item->question_text}")->implode("\n");
            return "DEPARTMENT: {$course->department?->code} - {$course->department?->name}\nCOURSE {$course->code} - {$course->name}\nSYLLABUS: {$course->syllabus_raw}\nPAST PAPERS:\n".($pastPapers ?: 'None recorded.')."\nPREVIOUS QUESTION BANK:\n".($questionBank ?: 'None recorded.');
        })->implode("\n\n---\n\n");
        $examContext = $examAnalyses->map(fn ($analysis) => "{$analysis->course?->code}: {$analysis->overall_verdict}, similarity {$analysis->similarity_score}%, coverage {$analysis->syllabus_coverage_score}%, question: {$analysis->new_question}")->implode("\n");
        $syllabusContext = $syllabusAnalyses->map(fn ($analysis) => "{$analysis->courseA?->code} vs {$analysis->courseB?->code}: {$analysis->strategic_advice}")->implode("\n");
        $departmentContext = $departments->map(fn ($department) => "{$department->code} - {$department->name}")->implode("\n");
        $facultyContext = $faculty->map(fn ($person) => "{$person->name} | {$person->email} | {$person->department}")->implode("\n");
        $context = "READ-ONLY UNIVERSITY DATABASE:\nDEPARTMENTS:\n{$departmentContext}\n\nFACULTY DIRECTORY:\n{$facultyContext}\n\nCOURSES, SYLLABI, PAST PAPERS, AND PREVIOUS QUESTION BANK:\n{$courseContext}\n\nRECENT EXAM ANALYSES:\n".($examContext ?: 'None recorded.')."\n\nRECENT SYLLABUS ANALYSES:\n".($syllabusContext ?: 'None recorded.');

        return response()->json(['reply' => $ai->chat($data['message'], $context)]);
    }
}