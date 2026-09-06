<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()->isAdmin(), 403);
    }

    private function buildDepartmentAnalysis($courses): array
    {
        $grouped = $courses->groupBy('department_id');
        $analysis = [];

        foreach ($grouped as $departmentId => $departmentCourses) {
            foreach ($departmentCourses as $course) {
                $others = $departmentCourses->reject(fn ($item) => $item->id === $course->id);
                $courseWords = $this->extractKeywords($course->name.' '.$course->code.' '.$course->syllabus_raw);
                $matches = [];

                foreach ($others as $other) {
                    $otherWords = $this->extractKeywords($other->name.' '.$other->code.' '.$other->syllabus_raw);
                    $shared = array_values(array_intersect($courseWords, $otherWords));
                    if (count($shared) > 0) {
                        $matches[] = ['course' => $other->code, 'concepts' => array_slice(array_values(array_unique($shared)), 0, 5)];
                    }
                }

                $insight = $others->isEmpty()
                    ? sprintf('%s is the first course in %s and has no department peer comparison yet.', $course->code, $course->department?->name ?? 'this department')
                    : sprintf('%s is aligned with %d other course(s) in %s. %s', $course->code, $others->count(), $course->department?->name ?? 'this department', $matches ? 'Top overlap: '.implode(', ', array_unique(array_merge(...array_map(fn ($match) => $match['concepts'], array_slice($matches, 0, 2))))) : 'No strong keyword overlap detected.');

                $analysis[$course->id] = [
                    'department_id' => $departmentId,
                    'department_name' => $course->department?->name ?? 'Department',
                    'course_code' => $course->code,
                    'course_name' => $course->name,
                    'course_count' => $departmentCourses->count(),
                    'shared_with' => $matches,
                    'summary' => $insight,
                ];
            }
        }

        return $analysis;
    }

    private function extractKeywords(string $content): array
    {
        preg_match_all('/[A-Za-z]{4,}/', strtolower($content), $matches);
        $stopWords = ['from', 'with', 'into', 'this', 'that', 'them', 'their', 'there', 'have', 'will', 'more', 'about', 'using', 'study', 'course', 'system', 'program', 'analysis', 'design', 'methods', 'models', 'through', 'within'];

        return array_values(array_unique(array_filter($matches[0], fn ($word) => ! in_array($word, $stopWords, true) && strlen($word) > 4)));
    }

    public function questionBank(Request $request)
    {
        $this->authorizeAdmin($request);

        $courses = Course::with(['user:id,name,email', 'department:id,code,name', 'questionBank' => fn ($query) => $query->orderBy('question_code')])
            ->orderBy('code')
            ->get(['id', 'user_id', 'department_id', 'code', 'name', 'syllabus_raw']);

        return response()->json([
            'courses' => $courses,
            'faculty' => \App\Models\User::where('role', 'faculty')->orderBy('name')->get(['id', 'name', 'email', 'department']),
            'departments' => Department::orderBy('code')->get(['id', 'code', 'name']),
            'department_analysis' => $this->buildDepartmentAnalysis($courses),
            'total_questions' => $courses->sum(fn ($course) => $course->questionBank->count()),
        ]);
    }

    public function storeFaculty(Request $request)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|unique:users,email',
            'department' => 'required|string|max:160',
            'password' => 'required|string|min:8',
        ]);
        $data['role'] = 'faculty';

        return response()->json(\App\Models\User::create($data), 201);
    }

    public function storeCourse(Request $request)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['user_id' => 'required|exists:users,id', 'department_id' => 'required|exists:departments,id', 'code' => 'required|string|max:30|unique:courses,code', 'name' => 'required|string|max:160', 'syllabus_raw' => 'required|string']);
        abort_unless(\App\Models\User::whereKey($data['user_id'])->where('role', 'faculty')->exists(), 422);

        $course = Course::create($data);
        $course->load(['user:id,name,email', 'department:id,code,name']);
        $departmentCourses = Course::with(['department:id,code,name'])->where('department_id', $course->department_id)->orderBy('code')->get(['id', 'department_id', 'code', 'name', 'syllabus_raw']);

        return response()->json([
            'course' => $course,
            'department_analysis' => $this->buildDepartmentAnalysis($departmentCourses),
        ], 201);
    }

    public function updateCourse(Request $request, Course $course)
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['user_id' => 'required|exists:users,id', 'department_id' => 'required|exists:departments,id', 'code' => 'required|string|max:30|unique:courses,code,'.$course->id, 'name' => 'required|string|max:160', 'syllabus_raw' => 'required|string']);
        abort_unless(\App\Models\User::whereKey($data['user_id'])->where('role', 'faculty')->exists(), 422);
        $course->update($data);
        return response()->json($course->fresh()->load(['user:id,name,email', 'department:id,code,name']));
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
