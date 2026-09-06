<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()->isAdmin(), 403);
    }

    public function questionBank(Request $request)
    {
        $this->authorizeAdmin($request);

        $courses = Course::with(['user:id,name,email', 'questionBank' => fn ($query) => $query->orderBy('question_code')])
            ->orderBy('code')
            ->get(['id', 'user_id', 'code', 'name', 'syllabus_raw']);

        return response()->json([
            'courses' => $courses,
            'faculty' => \App\Models\User::where('role', 'faculty')->orderBy('name')->get(['id', 'name', 'email', 'department']),
            'total_questions' => $courses->sum(fn ($course) => $course->questionBank->count()),
        ]);
    }

    public function storeCourse(Request $request)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['user_id' => 'required|exists:users,id', 'code' => 'required|string|max:30|unique:courses,code', 'name' => 'required|string|max:160', 'syllabus_raw' => 'required|string']);
        abort_unless(\App\Models\User::whereKey($data['user_id'])->where('role', 'faculty')->exists(), 422);
        return response()->json(Course::create($data)->load('user:id,name,email'), 201);
    }

    public function updateCourse(Request $request, Course $course)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['user_id' => 'required|exists:users,id', 'code' => 'required|string|max:30|unique:courses,code,'.$course->id, 'name' => 'required|string|max:160', 'syllabus_raw' => 'required|string']);
        abort_unless(\App\Models\User::whereKey($data['user_id'])->where('role', 'faculty')->exists(), 422);
        $course->update($data);
        return response()->json($course->fresh()->load('user:id,name,email'));
    }

    public function destroyCourse(Request $request, Course $course)
    {
        $this->authorizeAdmin($request);
        $course->delete();
        return response()->noContent();
    }

    public function storeQuestion(Request $request, Course $course)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['question_code' => 'required|string|max:40', 'question_text' => 'required|string', 'topic' => 'required|string|max:120', 'difficulty' => 'required|in:easy,medium,hard', 'question_type' => 'required|string|max:80', 'marks' => 'nullable|integer|min:1|max:100', 'estimated_coverage_percent' => 'nullable|integer|min:0|max:100']);
        return response()->json($course->questionBank()->create($data), 201);
    }

    public function updateQuestion(Request $request, Course $course, \App\Models\QuestionBankItem $question)
    {
        $this->authorizeAdmin($request);
        abort_unless($question->course_id === $course->id, 404);
        $data = $request->validate(['question_code' => 'required|string|max:40', 'question_text' => 'required|string', 'topic' => 'required|string|max:120', 'difficulty' => 'required|in:easy,medium,hard', 'question_type' => 'required|string|max:80', 'marks' => 'nullable|integer|min:1|max:100', 'estimated_coverage_percent' => 'nullable|integer|min:0|max:100']);
        $question->update($data);
        return response()->json($question->fresh());
    }

    public function destroyQuestion(Request $request, Course $course, \App\Models\QuestionBankItem $question)
    {
        $this->authorizeAdmin($request);
        abort_unless($question->course_id === $course->id, 404);
        $question->delete();
        return response()->noContent();
    }
}
