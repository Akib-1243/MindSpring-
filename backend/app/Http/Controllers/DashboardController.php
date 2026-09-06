<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\ExamAnalysis;
use App\Models\SyllabusAnalysis;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        return response()->json(['courses' => Course::where('user_id', $request->user()->id)->with(['department:id,code,name', 'pastPapers:id,course_id,year,term,question_text', 'questionBank' => fn ($query) => $query->orderBy('question_code')])->withCount('pastPapers')->orderBy('code')->get(['id', 'user_id', 'department_id', 'code', 'name', 'syllabus_raw']), 'recent_exam_analyses' => ExamAnalysis::where('user_id', $request->user()->id)->latest()->limit(5)->get(), 'recent_syllabus_analyses' => SyllabusAnalysis::where('user_id', $request->user()->id)->with(['courseA:id,code,name', 'courseB:id,code,name'])->latest()->limit(5)->get()]);
    }
}
