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
        return response()->json(['courses' => Course::where('user_id', $request->user()->id)->withCount('pastPapers')->get(), 'recent_exam_analyses' => ExamAnalysis::where('user_id', $request->user()->id)->latest()->limit(5)->get(), 'recent_syllabus_analyses' => SyllabusAnalysis::where('user_id', $request->user()->id)->latest()->limit(5)->get()]);
    }
}
