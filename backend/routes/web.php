<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['name' => 'Relavanet Academic Quality Suite', 'api' => '/api/health']));
