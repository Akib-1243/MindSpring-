<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamAnalysis;
use App\Models\PastPaper;
use App\Models\SyllabusAnalysis;
use App\Models\QuestionBankItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $cseDepartment = Department::updateOrCreate(['code' => 'CSE'], ['name' => 'Computer Science and Engineering']);
        $eeeDepartment = Department::updateOrCreate(['code' => 'EEE'], ['name' => 'Electrical and Electronics Engineering']);
        $password = Hash::make('relavanet-demo');
        $cseFaculty = User::updateOrCreate(
            ['email' => 'faculty@relavanet.edu'],
            ['name' => 'Dr. Amara Okafor', 'department' => 'Computer Science and Engineering', 'role' => 'faculty', 'password' => $password]
        );
        $eeeFaculty = User::updateOrCreate(
            ['email' => 'eee.faculty@relavanet.edu'],
            ['name' => 'Prof. Vikram Sen', 'department' => 'Electrical and Electronics Engineering', 'role' => 'faculty', 'password' => $password]
        );
        User::updateOrCreate(
            ['email' => 'admin@relavanet.edu'],
            ['name' => 'Relavanet Academic Admin', 'department' => 'Academic Quality Office', 'role' => 'admin', 'password' => $password]
        );

        $courses = [];
        foreach ([
            [$cseFaculty, $cseDepartment, 'CSE101', 'Programming Fundamentals', 'Variables, control flow, functions, arrays, pointers, recursion, debugging, and object-oriented programming using C.'],
            [$cseFaculty, $cseDepartment, 'CSE202', 'Data Structures and Algorithms', 'Complexity analysis, linked lists, stacks, queues, trees, graphs, sorting, searching, hashing, and algorithm design.'],
            [$cseFaculty, $cseDepartment, 'CSE401', 'Responsible Artificial Intelligence', 'Machine learning foundations, model evaluation, fairness, explainability, governance, and applied case studies.'],
            [$eeeFaculty, $eeeDepartment, 'EEE101', 'Circuit Theory', 'Ohm law, Kirchhoff laws, network theorems, transient response, AC circuits, resonance, and two-port networks.'],
            [$eeeFaculty, $eeeDepartment, 'EEE203', 'Digital Electronics', 'Boolean algebra, logic gates, combinational circuits, sequential circuits, counters, registers, memories, and programmable logic.'],
            [$eeeFaculty, $eeeDepartment, 'EEE402', 'Power Systems Engineering', 'Power generation, transmission lines, load flow, fault analysis, protection, stability, and renewable grid integration.'],
        ] as [$owner, $department, $code, $name, $syllabus]) {
            $courses[$code] = Course::updateOrCreate(
                ['code' => $code],
                ['user_id' => $owner->id, 'department_id' => $department->id, 'name' => $name, 'syllabus_raw' => $syllabus]
            );
        }

        $papers = [
            ['CSE101', '2023', 'Spring', 'Write a C program to find the largest element in an array and explain its time complexity.'],
            ['CSE101', '2024', 'Fall', 'Explain recursion with a suitable example and compare it with an iterative solution.'],
            ['CSE202', '2023', 'Fall', 'Compare the time and space complexity of merge sort and quick sort.'],
            ['CSE202', '2025', 'Spring', 'Design a breadth-first search algorithm and apply it to a directed graph.'],
            ['CSE401', '2024', 'Spring', 'Evaluate the trade-offs between model accuracy and fairness in a high-stakes application.'],
            ['CSE401', '2025', 'Fall', 'Design an evaluation plan for an explainable machine learning system.'],
            ['EEE101', '2023', 'Spring', 'Use Thevenin theorem to find the current through a load resistor in a DC network.'],
            ['EEE101', '2024', 'Fall', 'Derive the resonant frequency and bandwidth of a series RLC circuit.'],
            ['EEE203', '2024', 'Spring', 'Minimize a four-variable Boolean expression using a Karnaugh map.'],
            ['EEE203', '2025', 'Fall', 'Design a synchronous decade counter using JK flip-flops.'],
            ['EEE402', '2023', 'Fall', 'Explain the causes of voltage instability in a heavily loaded transmission network.'],
            ['EEE402', '2025', 'Spring', 'Compare overcurrent and distance protection for a high-voltage transmission line.'],
        ];
        foreach ($papers as [$code, $year, $term, $question]) {
            PastPaper::updateOrCreate(
                ['course_id' => $courses[$code]->id, 'year' => $year, 'term' => $term],
                ['question_text' => $question]
            );
        }

        $questionBank = [
            ['CSE101', 'QB-CSE101-01', 'Explain the difference between stack and heap memory in C with a practical example.', 'Memory management', 'medium', 'descriptive', 10, 12],
            ['CSE101', 'QB-CSE101-02', 'Write a recursive function to calculate the height of a binary tree and analyze its complexity.', 'Recursion', 'hard', 'coding', 15, 14],
            ['CSE202', 'QB-CSE202-01', 'Compare merge sort, quick sort, and heap sort in terms of time and space complexity.', 'Sorting algorithms', 'medium', 'descriptive', 12, 16],
            ['CSE202', 'QB-CSE202-02', 'Design a graph traversal solution that detects cycles in a directed graph.', 'Graph algorithms', 'hard', 'coding', 15, 15],
            ['CSE401', 'QB-CSE401-01', 'Explain how demographic parity and equalized odds can produce conflicting fairness outcomes.', 'Model fairness', 'hard', 'descriptive', 12, 18],
            ['CSE401', 'QB-CSE401-02', 'Design an evaluation plan for an explainable machine learning system used in healthcare.', 'Explainability', 'hard', 'case study', 15, 16],
            ['CSE401', 'QB-CSE401-03', 'Explain how fairness metrics can conflict when evaluating a machine learning model.', 'Model fairness', 'hard', 'descriptive', 12, 15],
            ['EEE101', 'QB-EEE101-01', 'Apply Thevenin theorem to determine load current in a DC network.', 'Network theorems', 'medium', 'problem solving', 10, 14],
            ['EEE101', 'QB-EEE101-02', 'Derive the resonant frequency and bandwidth of a series RLC circuit.', 'AC circuits', 'hard', 'derivation', 12, 14],
            ['EEE203', 'QB-EEE203-01', 'Minimize a four-variable Boolean expression using a Karnaugh map.', 'Boolean algebra', 'medium', 'problem solving', 10, 16],
            ['EEE203', 'QB-EEE203-02', 'Design a synchronous decade counter using JK flip-flops and show its state transitions.', 'Sequential circuits', 'hard', 'design', 15, 18],
            ['EEE402', 'QB-EEE402-01', 'Explain the causes and mitigation strategies for voltage instability in a transmission network.', 'Power system stability', 'hard', 'descriptive', 12, 17],
            ['EEE402', 'QB-EEE402-02', 'Compare overcurrent and distance protection for a high-voltage transmission line.', 'Protection systems', 'medium', 'comparative', 10, 15],
        ];
        foreach ($questionBank as [$code, $questionCode, $questionText, $topic, $difficulty, $type, $marks, $coverage]) {
            QuestionBankItem::updateOrCreate(
                ['course_id' => $courses[$code]->id, 'question_code' => $questionCode],
                ['question_text' => $questionText, 'topic' => $topic, 'difficulty' => $difficulty, 'question_type' => $type, 'marks' => $marks, 'estimated_coverage_percent' => $coverage]
            );
        }

        $syllabusAnalysis = SyllabusAnalysis::updateOrCreate(
            ['user_id' => $cseFaculty->id, 'course_a_id' => $courses['CSE202']->id, 'course_b_id' => $courses['CSE401']->id],
            [
                'overlaps' => [['concept' => 'Algorithmic complexity', 'risk_level' => 'low', 'explanation' => 'Both courses evaluate how computational choices affect system performance.']],
                'unique_to_a' => ['Graph algorithms', 'Dynamic programming', 'Hash tables'],
                'unique_to_b' => ['Model fairness', 'Explainability', 'AI governance'],
                'strategic_advice' => 'Keep the shared complexity foundations explicit, then separate assessment outcomes around algorithm implementation versus responsible model deployment.',
            ]
        );

        ExamAnalysis::updateOrCreate(
            ['user_id' => $cseFaculty->id, 'course_id' => $courses['CSE401']->id, 'new_question' => 'Explain how fairness metrics can conflict when evaluating a machine learning model.'],
            [
                'syllabus_snapshot' => $courses['CSE401']->syllabus_raw,
                'similarity_score' => 18,
                'syllabus_coverage_score' => 92,
                'matching_questions' => [['year' => '2024', 'similarity_percent' => 18, 'explanation' => 'Shares the fairness evaluation theme but asks about a distinct concept.']],
                'risk_flags' => [],
                'overall_verdict' => 'Safe',
            ]
        );

        ExamAnalysis::updateOrCreate(
            ['user_id' => $eeeFaculty->id, 'course_id' => $courses['EEE203']->id, 'new_question' => 'Design a synchronous decade counter using JK flip-flops and show the state transition table.'],
            [
                'syllabus_snapshot' => $courses['EEE203']->syllabus_raw,
                'similarity_score' => 76,
                'syllabus_coverage_score' => 96,
                'matching_questions' => [['year' => '2025', 'similarity_percent' => 76, 'explanation' => 'The new question closely repeats the prior counter-design task.']],
                'risk_flags' => ['High overlap with the 2025 Fall paper.', 'Consider changing the counter type or implementation constraints.'],
                'overall_verdict' => 'Needs Rewording',
            ]
        );
    }
}
