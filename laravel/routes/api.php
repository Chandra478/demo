<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\StatsController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
Route::get('sanctum/csrf-cookie', function (Request $request) {
    return response()->noContent()
        ->cookie('XSRF-TOKEN', csrf_token(), 0, '/', null, false, true, false, 'Lax');
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::apiResource('projects', ProjectController::class)
        ->except(['index', 'update', 'destroy']);
    Route::patch('/projects/{project}/approve', [ProjectController::class, 'approve']);
    Route::patch('/projects/{project}/reject', [ProjectController::class, 'reject']);
    Route::post('/projects/bulk-action', [ProjectController::class, 'bulkAction']);

    Route::get('/stats', [StatsController::class, 'index']);
});

