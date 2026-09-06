<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExamForensicController;
use App\Http\Controllers\SyllabusAnalysisController;
use App\Http\Controllers\FacultyChatController;
use App\Http\Controllers\AdminController;

Route::prefix('faculty')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
    Route::middleware(['auth:sanctum', 'role:faculty'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/dashboard', DashboardController::class);
        Route::apiResource('courses', CourseController::class)->only(['index', 'store', 'show']);
        Route::post('/syllabus/analyze', [SyllabusAnalysisController::class, 'analyze']);
        Route::post('/exam/analyze', [ExamForensicController::class, 'analyze']);
        Route::post('/chat', FacultyChatController::class);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/question-bank', [AdminController::class, 'questionBank']);
    Route::post('/faculty', [AdminController::class, 'storeFaculty']);
    Route::post('/courses', [AdminController::class, 'storeCourse']);
    Route::put('/courses/{course}', [AdminController::class, 'updateCourse']);
    Route::delete('/courses/{course}', [AdminController::class, 'destroyCourse']);
    Route::post('/courses/{course}/questions', [AdminController::class, 'storeQuestion']);
    Route::put('/courses/{course}/questions/{question}', [AdminController::class, 'updateQuestion']);
    Route::delete('/courses/{course}/questions/{question}', [AdminController::class, 'destroyQuestion']);
});

Route::get('/health', fn () => ['status' => 'ok', 'service' => 'mindspring-academic-quality-suite']);
