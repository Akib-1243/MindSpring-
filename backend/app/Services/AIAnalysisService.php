<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AIAnalysisService
{
    public function chat(string $message, string $courseContext = ''): string
    {
        if (! config('ai.openai_key')) {
            return 'AI chat is not configured yet. Add OPENAI_API_KEY to enable the faculty assistant.';
        }

        $response = Http::withToken(config('ai.openai_key'))->timeout(45)->post(rtrim(config('ai.base_url'), '/').'/chat/completions', [
            'model' => config('ai.model'),
            'messages' => [
                ['role' => 'system', 'content' => 'You are MindSpring\'s concise faculty academic quality assistant. Give practical, evidence-aware guidance about curriculum design, syllabus alignment, assessment quality, and exam originality. Use the supplied faculty database context when relevant. Treat it as read-only reference data, never claim to modify it, and say when the answer is not present. Do not invent institutional policy.'],
                ['role' => 'user', 'content' => ($courseContext ? "READ-ONLY FACULTY DATABASE CONTEXT:\n{$courseContext}\n\nFACULTY QUESTION:\n" : '').$message],
            ],
            'temperature' => 0.3,
        ]);

        if ($response->failed()) {
            Log::error('AI chat failed', ['body' => $response->body()]);
            throw new RuntimeException('AI service unavailable.');
        }

        return trim((string) $response->json('choices.0.message.content', '')) ?: 'I could not generate a response. Please try again.';
    }

    public function analyzeSyllabusOverlap(string $syllabusA, string $syllabusB): array
    {
        return $this->callOpenAI('Compare these university syllabi. Return JSON with overlaps (array of concept, risk_level, explanation), unique_to_a (array of strings), unique_to_b (array of strings), and strategic_advice (string).\n\nSYLLABUS A:\n'.$syllabusA.'\n\nSYLLABUS B:\n'.$syllabusB);
    }

    public function analyzeExamForensic(string $newQuestion, string $pastPapers, string $questionBank, string $syllabus): array
    {
        return $this->callOpenAI('Audit this exam question against the syllabus, previous exam papers, and question bank. Return JSON only with similarity_score (0-100), syllabus_coverage_score (0-100), question_bank_similarity_score (0-100), question_bank_coverage_score (0-100), matching_previous_questions (array of year, similarity_percent, explanation), question_bank_matches (array of question_code, similarity_percent, explanation), covered_topics (array of topic, coverage_percent, evidence), uncovered_topics (array of topic, reason), risk_flags (array of strings), analysis_summary (string), and overall_verdict (Safe, Needs Rewording, or High Risk). Percentages must be integers.\n\nNEW QUESTION:\n'.$newQuestion.'\n\nPREVIOUS EXAM PAPERS:\n'.$pastPapers.'\n\nQUESTION BANK:\n'.$questionBank.'\n\nSYLLABUS:\n'.$syllabus);
    }

    private function callOpenAI(string $prompt): array
    {
        if (! config('ai.openai_key')) {
            return ['overlaps' => [], 'unique_to_a' => [], 'unique_to_b' => [], 'strategic_advice' => 'Add OPENAI_API_KEY to enable live analysis.', 'similarity_score' => 0, 'syllabus_coverage_score' => 0, 'matching_previous_questions' => [], 'risk_flags' => ['AI analysis is not configured yet.'], 'overall_verdict' => 'Needs Review'];
        }
        $response = Http::withToken(config('ai.openai_key'))->timeout(45)->post(rtrim(config('ai.base_url'), '/').'/chat/completions', ['model' => config('ai.model'), 'response_format' => ['type' => 'json_object'], 'messages' => [['role' => 'system', 'content' => 'You are an expert academic curriculum analyst. Output only valid JSON.'], ['role' => 'user', 'content' => $prompt]], 'temperature' => 0.2]);
        if ($response->failed()) { Log::error('AI analysis failed', ['body' => $response->body()]); throw new RuntimeException('AI service unavailable.'); }
        return json_decode($response->json('choices.0.message.content', '{}'), true) ?: [];
    }
}
