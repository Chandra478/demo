<?php

namespace App\Http\Controllers;
use App\Models\Project;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $totalProjects = Project::count();

        $stats = [
            'total_projects' => $totalProjects,
            'pending_projects' => Project::where('status', 'pending')->count(),
            'approved_projects' => Project::where('status', 'approved')->count(),
            'rejected_projects' => Project::where('status', 'rejected')->count(),
        ];

        // Calculate percentages
        foreach (['pending', 'approved', 'rejected'] as $status) {
            $count = $stats["{$status}_projects"];
            $stats["{$status}_percentage"] = $totalProjects > 0 ? round(($count / $totalProjects) * 100, 2) : 0;
        }

        return response()->json($stats);
    }
}
