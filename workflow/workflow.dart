// ============================================================
// File: academic_quality_suite_blueprint.dart
// Purpose: Complete blueprint for the "Academic Quality Control Suite"
// Tech Stack: Laravel 11 + MySQL + OpenAI API (GPT-4-turbo)
// Features: Ghost Course (Syllabus Duet) + Exam Forensics
// Author: AI Build Hackathon Team
// ============================================================

/*
================================================================================
                        1. SYSTEM OVERVIEW (THE WORKFLOW)
================================================================================

We are building a 2-in-1 platform. Faculty login → Dashboard → Select a Tool:

- Tool A (Ghost Course): Upload/Paste 2 syllabi → AI compares them → Shows 
  Overlaps, Unique Edges, and Strategic Pivot Advice.

- Tool B (Exam Forensics): Select a course → Paste new question → AI cross-
  references with Syllabus + Past Papers → Returns Similarity %, Syllabus 
  Alignment %, and Risk Flags.

Core Design Principle: All heavy lifting is done by a single Laravel 
`AIAnalysisService` that talks to OpenAI. The database stores the inputs and 
results (JSON) so faculty have a history of their analyses.


================================================================================
                        2. ENTITY RELATIONSHIP DIAGRAM (ERD)
================================================================================

Copy this Mermaid ERD and paste it into https://mermaid.live/ to visualize it.

---[BEGIN ERD]---
erDiagram
    users ||--o{ courses : "creates"
    users ||--o{ syllabus_analyses : "initiates"
    users ||--o{ exam_analyses : "initiates"
    
    courses ||--o{ past_papers : "contains"
    courses ||--o{ syllabus_analyses : "source_a"
    courses ||--o{ syllabus_analyses : "source_b"
    courses ||--o{ exam_analyses : "target"

    users {
        bigint id PK
        string name
        string email
        string department
        timestamp created_at
    }

    courses {
        bigint id PK
        bigint user_id FK
        string name
        string code
        text syllabus_raw "The full text syllabus"
        timestamp created_at
    }

    past_papers {
        bigint id PK
        bigint course_id FK
        string year "e.g. 2023"
        string term "Fall/Spring"
        text question_text
        timestamp created_at
    }

    syllabus_analyses {
        bigint id PK
        bigint user_id FK
        bigint course_a_id FK "Reference to courses table"
        bigint course_b_id FK "Reference to courses table"
        json overlaps "Stores array of {concept, risk_level, explanation}"
        json unique_to_a "Stores array of strings"
        json unique_to_b "Stores array of strings"
        text strategic_advice
        timestamp created_at
    }

    exam_analyses {
        bigint id PK
        bigint user_id FK
        bigint course_id FK
        text new_question
        text syllabus_snapshot "The syllabus text at time of analysis"
        integer similarity_score "0-100%"
        integer syllabus_coverage_score "0-100%"
        json matching_questions "Stores {year, similarity_percent, explanation}"
        json risk_flags "Stores array of warning strings"
        string overall_verdict "Safe/Needs Rewording/High Risk"
        timestamp created_at
    }
---[END ERD]---


================================================================================
                   3. PROJECT DIRECTORY STRUCTURE (LARAVEL)
================================================================================

app/
├── Http/
│   ├── Controllers/
│   │   ├── DashboardController.php
│   │   ├── SyllabusAnalysisController.php
│   │   └── ExamForensicController.php
│   └── Requests/
│       ├── SyllabusCompareRequest.php
│       └── ExamAnalyzeRequest.php
├── Models/
│   ├── User.php
│   ├── Course.php
│   ├── PastPaper.php
│   ├── SyllabusAnalysis.php
│   └── ExamAnalysis.php
└── Services/
    └── AIAnalysisService.php  <-- Core logic for AI communication
config/
└── ai.php                     <-- API Keys and Prompt templates
resources/
├── views/
│   ├── layouts/
│   │   └── app.blade.php
│   ├── dashboard.blade.php
│   └── analysis/
│       ├── syllabus.blade.php
│       ├── syllabus-result.blade.php
│       ├── exam.blade.php
│       └── exam-result.blade.php
routes/
└── web.php                    <-- Define all routes here
database/
└── migrations/
    ├── create_users_table.php
    ├── create_courses_table.php
    ├── create_past_papers_table.php
    ├── create_syllabus_analyses_table.php
    └── create_exam_analyses_table.php


================================================================================
                   4. CORE DATABASE MIGRATIONS (THE SCHEMA)
================================================================================

Run `php artisan make:migration` for each of these.

---[COURSES TABLE]---
Schema::create('courses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->string('code')->unique();
    $table->longText('syllabus_raw');
    $table->timestamps();
});

---[PAST PAPERS TABLE]---
Schema::create('past_papers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('course_id')->constrained()->onDelete('cascade');
    $table->string('year');
    $table->string('term')->nullable();
    $table->longText('question_text');
    $table->timestamps();
});

---[SYLLABUS ANALYSES TABLE]---
Schema::create('syllabus_analyses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->foreignId('course_a_id')->constrained('courses');
    $table->foreignId('course_b_id')->constrained('courses');
    $table->json('overlaps');
    $table->json('unique_to_a');
    $table->json('unique_to_b');
    $table->text('strategic_advice');
    $table->timestamps();
});

---[EXAM ANALYSES TABLE]---
Schema::create('exam_analyses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->foreignId('course_id')->constrained();
    $table->longText('new_question');
    $table->longText('syllabus_snapshot');
    $table->integer('similarity_score');
    $table->integer('syllabus_coverage_score');
    $table->json('matching_questions');
    $table->json('risk_flags');
    $table->string('overall_verdict');
    $table->timestamps();
});


================================================================================
                5. THE AI SERVICE (CORE BRAIN) 
                app/Services/AIAnalysisService.php
================================================================================

This single class handles both tools using GuzzleHttp to call OpenAI.

---[CODE START]---
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIAnalysisService
{
    protected $apiKey;
    protected $model;

    public function __construct()
    {
        $this->apiKey = config('ai.openai_key');
        $this->model = config('ai.model', 'gpt-4-turbo');
    }

    // TOOL 1: Ghost Course (Syllabus Duet)
    public function analyzeSyllabusOverlap(string $syllabusA, string $syllabusB): array
    {
        $prompt = $this->getSyllabusPrompt($syllabusA, $syllabusB);
        return $this->callOpenAI($prompt);
    }

    // TOOL 2: Exam Forensics
    public function analyzeExamForensic(string $newQuestion, string $pastPapers, string $syllabus): array
    {
        $prompt = $this->getExamPrompt($newQuestion, $pastPapers, $syllabus);
        return $this->callOpenAI($prompt);
    }

    // Generic OpenAI caller with JSON enforcement
    private function callOpenAI(string $prompt): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $this->model,
            'response_format' => ['type' => 'json_object'],
            'messages' => [
                ['role' => 'system', 'content' => 'You are an expert academic curriculum analyst. Output only valid JSON.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.2,
        ]);

        if ($response->failed()) {
            Log::error('OpenAI API Error: ' . $response->body());
            throw new \Exception('AI Service unavailable.');
        }

        $body = $response->json();
        $content = $body['choices'][0]['message']['content'] ?? '{}';
        return json_decode($content, true);
    }

    // ------------------------------------------------------
    // PROMPT TEMPLATES (Paste your exact long prompts here)
    // ------------------------------------------------------

    private function getSyllabusPrompt($a, $b): string
    {
        return <<<EOT
You are an expert academic curriculum analyst. Your task is to compare two university course syllabi (Syllabus A and Syllabus B)...

[!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!]
[!!!  PASTE THE FULL GHOST COURSE PROMPT FROM THE EARLIER RESPONSE HERE   !!!]
[!!!  Replace {content_a} with: {$a}                                       !!!]
[!!!  Replace {content_b} with: {$b}                                       !!!]
[!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!]
EOT;
    }

    private function getExamPrompt($q, $past, $syll): string
    {
        return <<<EOT
You are an expert academic assessment auditor...

[!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!]
[!!!  PASTE THE FULL EXAM FORENSICS PROMPT FROM THE EARLIER RESPONSE HERE !!!]
[!!!  Replace {new_question} with: {$q}                                    !!!]
[!!!  Replace {previous_questions} with: {$past}                           !!!]
[!!!  Replace {syllabus_text} with: {$syll}                                !!!]
[!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!]
EOT;
    }
}
---[CODE END]---


================================================================================
                6. LARAVEL CONTROLLERS (THE WORKFLOW LOGIC)
================================================================================

---[ExamForensicController.php]---
<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\ExamAnalysis;
use App\Services\AIAnalysisService;
use Illuminate\Http\Request;

class ExamForensicController extends Controller
{
    public function index()
    {
        $courses = Course::where('user_id', auth()->id())->get();
        return view('analysis.exam', compact('courses'));
    }

    public function analyze(Request $request, AIAnalysisService $aiService)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'new_question' => 'required|string|min:10',
        ]);

        $course = Course::find($validated['course_id']);
        $pastPapers = $course->pastPapers->pluck('question_text')->implode("\n---\n");
        $syllabus = $course->syllabus_raw;

        $result = $aiService->analyzeExamForensic(
            $validated['new_question'],
            $pastPapers,
            $syllabus
        );

        $analysis = ExamAnalysis::create([
            'user_id' => auth()->id(),
            'course_id' => $course->id,
            'new_question' => $validated['new_question'],
            'syllabus_snapshot' => $syllabus,
            'similarity_score' => $result['similarity_score'] ?? 0,
            'syllabus_coverage_score' => $result['syllabus_coverage_score'] ?? 0,
            'matching_questions' => json_encode($result['matching_previous_questions'] ?? []),
            'risk_flags' => json_encode($result['risk_flags'] ?? []),
            'overall_verdict' => $result['overall_verdict'] ?? 'Unknown',
        ]);

        return redirect()->route('exam.show', $analysis->id);
    }

    public function show(ExamAnalysis $analysis)
    {
        return view('analysis.exam-result', compact('analysis'));
    }
}


================================================================================
                7. THE FRONTEND UI (BLADE + TAILWIND)
================================================================================

---[resources/views/analysis/exam.blade.php]---
<x-app-layout>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold mb-4">🔬 Exam Forensics</h1>
        <form action="{{ route('exam.analyze') }}" method="POST">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block font-medium">Select Course</label>
                    <select name="course_id" class="w-full border-gray-300 rounded-md">
                        @foreach($courses as $course)
                            <option value="{{ $course->id }}">{{ $course->name }} ({{ $course->code }})</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block font-medium">New Question</label>
                    <textarea name="new_question" rows="4" class="w-full border-gray-300 rounded-md" placeholder="Paste your new exam question..."></textarea>
                </div>
            </div>
            <div class="mt-4">
                <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Run Forensic Analysis 🚀
                </button>
            </div>
        </form>
    </div>
</x-app-layout>

---[resources/views/analysis/exam-result.blade.php]---
<x-app-layout>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h1 class="text-2xl font-bold">📊 Forensic Report</h1>
            
            <div class="grid grid-cols-2 gap-4 mt-6">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500">Reuse Similarity</p>
                    <p class="text-3xl font-bold {{ $analysis->similarity_score > 50 ? 'text-red-600' : 'text-green-600' }}">
                        {{ $analysis->similarity_score }}%
                    </p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500">Syllabus Alignment</p>
                    <p class="text-3xl font-bold {{ $analysis->syllabus_coverage_score < 70 ? 'text-red-600' : 'text-green-600' }}">
                        {{ $analysis->syllabus_coverage_score }}%
                    </p>
                </div>
            </div>

            <div class="mt-6">
                <h2 class="text-lg font-semibold">🚩 Risk Flags</h2>
                @foreach(json_decode($analysis->risk_flags) as $flag)
                    <div class="p-3 mt-2 bg-red-100 text-red-800 rounded-lg">
                        ⚠️ {{ $flag }}
                    </div>
                @endforeach
            </div>

            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <h2 class="text-lg font-semibold">⚖️ Verdict</h2>
                <p class="text-xl font-bold">{{ $analysis->overall_verdict }}</p>
            </div>
            
            <a href="{{ route('exam.index') }}" class="mt-6 inline-block text-blue-600">← Analyze another question</a>
        </div>
    </div>
</x-app-layout>


================================================================================
                        8. ROUTES (web.php)
================================================================================

use App\Http\Controllers\ExamForensicController;
use App\Http\Controllers\SyllabusAnalysisController;

// GHOST COURSE (Syllabus)
Route::get('/syllabus/compare', [SyllabusAnalysisController::class, 'index'])->name('syllabus.index');
Route::post('/syllabus/analyze', [SyllabusAnalysisController::class, 'analyze'])->name('syllabus.analyze');
Route::get('/syllabus/result/{analysis}', [SyllabusAnalysisController::class, 'show'])->name('syllabus.show');

// EXAM FORENSICS
Route::get('/exam/forensic', [ExamForensicController::class, 'index'])->name('exam.index');
Route::post('/exam/analyze', [ExamForensicController::class, 'analyze'])->name('exam.analyze');
Route::get('/exam/result/{analysis}', [ExamForensicController::class, 'show'])->name('exam.show');


================================================================================
                    9. NECESSARY DIRECTIONS FOR THE TEAM
================================================================================

1.  SEED DATA QUICKLY:
    - To demo, manually insert 1 Course and 3 Past Papers via Tinker or a seeder
      so you don't waste time typing during the presentation.

2.  THE "3-HOUR" REALITY CHECK:
    - If you have only 3 hours to code this Laravel app, SKIP authentication 
      (use a default user ID 1) and SKIP the UI design.
    - Use `php artisan tinker` to manually create a Course and Past Papers.
    - Write the `AIAnalysisService` first. Test it with 
      `dd($service->analyzeExamForensic(...))` in a controller.
    - Only build the Blade views if the backend returns data perfectly.

3.  CONFIGURATION (config/ai.php):
    <?php
    return [
        'openai_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4-turbo'),
    ];

4.  HANDLING THE "COMBINED SKELETON":
    - Both features are inside `AIAnalysisService`. You don't duplicate AI logic.
      The Controllers just call different methods on the same Service.

5.  PRESENTATION HOOK FOR JUDGES:
    - Start your demo by showing EXAM FORENSICS. It is visual (percentages, 
      red/green alerts).
    - Then say, "We designed our architecture to be modular. With the exact same 
      backend AI engine, we also solve syllabus overlap—watch..." and switch 
      tabs to show the GHOST COURSE result. This proves scalability.

6.  PIVOT STRATEGY (If time runs out):
    - If Tab 1 (Ghost Course) crashes, comment it out and present only Tab 2 
      (Exam Forensics). 
    - In your pitch: "Our MVP focuses on Exam Forensics, but the architecture is 
      ready to expand to Syllabus Overlap as a future feature."
    - A perfectly working single-feature demo beats a broken two-feature demo.

7.  INSTALLATION COMMANDS (Run these first):
    composer require guzzlehttp/guzzle
    composer require laravel/tinker --dev
    npm install -D tailwindcss postcss autoprefixer
    php artisan vendor:publish --tag=tailwind-config

8.  QUICK START SEQUENCE:
    php artisan migrate
    php artisan tinker
    >>> $user = User::create(['name'=>'Test', 'email'=>'test@test.com', 'password'=>bcrypt('pass')]);
    >>> $course = Course::create(['user_id'=>1, 'name'=>'AI 101', 'code'=>'CS101', 'syllabus_raw'=>'...']);
    >>> PastPaper::create(['course_id'=>1, 'year'=>'2024', 'question_text'=>'...']);
    php artisan serve

================================================================================
                               END OF BLUEPRINT
================================================================================
*/