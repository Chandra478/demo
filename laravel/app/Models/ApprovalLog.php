<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Project;
class ApprovalLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'action',
    ];


    public function project()
{
    return $this->belongsTo(Project::class);
}

public function user()
{
    return $this->belongsTo(User::class);
}
}
