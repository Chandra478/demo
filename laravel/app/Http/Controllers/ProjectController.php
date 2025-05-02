<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Http\Resources\ProjectResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\ApprovalLog;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\ProjectSubmitted;
use App\Notifications\ProjectApproved;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
    }

    public function index(Request $request)
    {

        $query = Project::with(['user', 'approvalLogs']);

        if ($request->user() && $request->user()->role === 'user') {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->status) {

            $query->where('status', $request->status);
        }

        if ($request->has('sort')) {
            $query->orderBy($request->sort, $request->direction ?? 'Desc');
        }

        return ProjectResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
        $file->move('project_files', $fileName);

        $project = Project::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $fileName,
            'status' => 'pending',
        ]);

        // Dispatch project submitted notification

        return new ProjectResource($project->load('user'));
    }

    public function show(Project $project)
    {
        return new ProjectResource($project->load(['user', 'approvalLogs']));
    }

    public function approve(Request $request, Project $project)
    {
        $this->authorize('approve', $project);

        $result = DB::select("CALL sp_approve_project(?)", [$project->id]);

        // Dispatch approval notification

        return response()->json([
            'message' => 'Project approved successfully',
            'project' => new ProjectResource($project->fresh()->load(['user', 'approvalLogs']))
        ]);
    }

    public function reject(Request $request, Project $project)
    {
        $this->authorize('approve', $project);

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $project->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        $project->approvalLogs()->create([
            'user_id' => $request->user()->id,
            'action' => 'rejected',
            'reason' => $request->reason,
        ]);

        // Dispatch rejection notification

        return response()->json([
            'message' => 'Project rejected successfully',
            'project' => new ProjectResource($project->load(['user', 'approvalLogs']))
        ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'project_ids' => 'required|array',
            'project_ids.*' => 'exists:projects,id',
            'reason' => 'required_if:action,reject|string|max:500|nullable',
        ]);

        $projects = Project::whereIn('id', $request->project_ids)->get();

        foreach ($projects as $project) {
            if ($request->action === 'approve') {
                DB::select("CALL sp_approve_project(?)", [$project->id]);
            } else {
                $project->update([
                    'status' => 'rejected',
                    'rejection_reason' => $request->reason,
                ]);

                $project->approvalLogs()->create([
                    'user_id' => $request->user()->id,
                    'action' => 'rejected',
                    'reason' => $request->reason,
                ]);
            }
        }

        return response()->json([
            'message' => 'Bulk action completed successfully',
            'count' => count($projects),
        ]);
    }
}
