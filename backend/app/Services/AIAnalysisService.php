<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AIAnalysisService
{
    public function analyzeSyllabusOverlap(string $syllabusA, string $syllabusB): array
    {
        return $this->callOpenAI('Compare these university syllabi. Return JSON with overlaps (array of concept, risk_level, explanation), unique_to_a (array of strings), unique_to_b (array of strings), and strategic_advice (string).\n\nSYLLABUS A:\n'.$syllabusA.'\n\nSYLLABUS B:\n'.$syllabusB);
    }

    public function analyzeExamForensic(string $newQuestion, string $pastPapers, string $syllabus): array
    {
        return $this->callOpenAI('Audit this exam question against the syllabus and past papers. Return JSON with similarity_score (0-100), syllabus_coverage_score (0-100), matching_previous_questions (array of year, similarity_percent, explanation), risk_flags (array of strings), and overall_verdict (Safe, Needs Rewording, or High Risk).\n\nNEW QUESTION:\n'.$newQuestion.'\n\nPAST PAPERS:\n'.$pastPapers.'\n\nSYLLABUS:\n'.$syllabus);
    }

    private function callOpenAI(string $prompt): array
    {
        if (! config('ai.openai_key')) {
            return ['overlaps' => [], 'unique_to_a' => [], 'unique_to_b' => [], 'strategic_advice' => 'Add OPENAI_API_KEY to enable live analysis.', 'similarity_score' => 0, 'syllabus_coverage_score' => 0, 'matching_previous_questions' => [], 'risk_flags' => ['AI analysis is not configured yet.'], 'overall_verdict' => 'Needs Review'];
        }
        $response = Http::withToken(config('ai.openai_key'))->timeout(45)->post('https://api.openai.com/v1/chat/completions', ['model' => config('ai.model'), 'response_format' => ['type' => 'json_object'], 'messages' => [['role' => 'system', 'content' => 'You are an expert academic curriculum analyst. Output only valid JSON.'], ['role' => 'user', 'content' => $prompt]], 'temperature' => 0.2]);
        if ($response->failed()) { Log::error('AI analysis failed', ['body' => $response->body()]); throw new RuntimeException('AI service unavailable.'); }
        return json_decode($response->json('choices.0.message.content', '{}'), true) ?: [];
    }
}
