<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExamForensicController;
use App\Http\Controllers\SyllabusAnalysisController;

Route::prefix('faculty')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/dashboard', DashboardController::class);
        Route::apiResource('courses', CourseController::class)->only(['index', 'store', 'show']);
        Route::post('/syllabus/analyze', [SyllabusAnalysisController::class, 'analyze']);
        Route::post('/exam/analyze', [ExamForensicController::class, 'analyze']);
    });
});

Route::get('/health', fn () => ['status' => 'ok', 'service' => 'relavanet-academic-quality-suite']);
