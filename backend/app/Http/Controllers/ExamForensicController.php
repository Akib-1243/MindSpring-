<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\ExamAnalysis;
use App\Services\AIAnalysisService;

class ExamForensicController extends Controller
{
    public function analyze(Request $request, AIAnalysisService $ai)
    {
        $data = $request->validate(['course_id' => 'required|exists:courses,id', 'new_question' => 'required|string|min:10']);
        $course = Course::where('id', $data['course_id'])->where('user_id', $request->user()->id)->with(['pastPapers', 'questionBank'])->firstOrFail();
        $pastPapers = $course->pastPapers->map(fn ($paper) => $paper->year.': '.$paper->question_text)->implode("\n---\n");
        $questionBank = $course->questionBank->map(fn ($item) => $item->question_code.' | '.$item->topic.' | '.$item->question_text)->implode("\n---\n");
        $result = $ai->analyzeExamForensic($data['new_question'], $pastPapers, $questionBank, $course->syllabus_raw);
        $questionBankComparison = $this->compareQuestionBank($data['new_question'], $course->questionBank);
        $bankSimilarity = max((int) ($result['question_bank_similarity_score'] ?? 0), $questionBankComparison['similarity']);
        $bankCoverage = max((int) ($result['question_bank_coverage_score'] ?? 0), $questionBankComparison['coverage']);
        $bankMatches = !empty($result['question_bank_matches']) ? $result['question_bank_matches'] : $questionBankComparison['matches'];
        $coveredTopics = !empty($result['covered_topics']) ? $result['covered_topics'] : $questionBankComparison['covered_topics'];
        $analysis = ExamAnalysis::create(['user_id' => $request->user()->id, 'course_id' => $course->id, 'new_question' => $data['new_question'], 'syllabus_snapshot' => $course->syllabus_raw, 'similarity_score' => min(100, max(0, (int) ($result['similarity_score'] ?? 0))), 'syllabus_coverage_score' => min(100, max(0, (int) ($result['syllabus_coverage_score'] ?? 0))), 'question_bank_similarity_score' => min(100, max(0, $bankSimilarity)), 'question_bank_coverage_score' => min(100, max(0, $bankCoverage)), 'matching_questions' => $result['matching_previous_questions'] ?? [], 'question_bank_matches' => $bankMatches, 'covered_topics' => $coveredTopics, 'uncovered_topics' => $result['uncovered_topics'] ?? [], 'risk_flags' => $result['risk_flags'] ?? [], 'analysis_summary' => $result['analysis_summary'] ?? '', 'overall_verdict' => $result['overall_verdict'] ?? 'Needs Review']);
        return response()->json($analysis->load('course'), 201);
    }

    private function compareQuestionBank(string $question, $questionBank): array
    {
        $normalize = fn (string $value) => array_values(array_filter(preg_split('/[^a-z0-9]+/i', strtolower($value)), fn ($word) => strlen($word) > 3));
        $questionWords = array_unique($normalize($question));
        $matches = [];
        foreach ($questionBank as $item) {
            $bankWords = array_unique($normalize($item->question_text.' '.$item->topic));
            $overlap = count(array_intersect($questionWords, $bankWords));
            $score = $questionWords ? (int) round(($overlap / count($questionWords)) * 100) : 0;
            if ($score >= 10) $matches[] = ['question_code' => $item->question_code, 'similarity_percent' => min(100, $score), 'explanation' => 'Shares key concepts with this question-bank entry.'];
        }
        usort($matches, fn ($left, $right) => $right['similarity_percent'] <=> $left['similarity_percent']);
        $matches = array_slice($matches, 0, 5);
        $coveredTopics = collect($matches)->map(fn ($match) => ['topic' => $questionBank->firstWhere('question_code', $match['question_code'])->topic, 'coverage_percent' => $match['similarity_percent'], 'evidence' => $match['explanation']])->unique('topic')->values()->all();
        return ['similarity' => $matches[0]['similarity_percent'] ?? 0, 'coverage' => $matches ? min(100, (int) round(collect($matches)->avg('similarity_percent'))) : 0, 'matches' => $matches, 'covered_topics' => $coveredTopics];
    }
}
