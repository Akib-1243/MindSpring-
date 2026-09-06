<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;

class CourseController extends Controller
{
    public function index(Request $request) { return response()->json(Course::with('pastPapers')->orderBy('code')->get()); }
    public function store(Request $request) { $data = $request->validate(['name' => 'required|string|max:160', 'code' => 'required|string|max:30|unique:courses,code', 'syllabus_raw' => 'required|string']); $course = $request->user()->courses()->create($data); return response()->json($course, 201); }
    public function show(Request $request, Course $course) { return response()->json($course->load('pastPapers')); }
}
