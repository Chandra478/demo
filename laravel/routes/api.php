<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PorjectController;
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

    Route::apiResource('projects', PorjectController::class)->except(['update', 'destroy']);
    Route::patch('/projects/{project}/approve', [PorjectController::class, 'approve']);
    Route::patch('/projects/{project}/reject', [PorjectController::class, 'reject']);
    Route::post('/projects/bulk-action', [PorjectController::class, 'bulkAction']);

    Route::get('/stats', [StatsController::class, 'index']);
    Route::post('/projects', [PorjectController::class, 'store']);
});
