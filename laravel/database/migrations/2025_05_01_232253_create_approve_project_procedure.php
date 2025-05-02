<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $procedure = "
    CREATE PROCEDURE sp_approve_project(IN p_project_id INT)
    BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            SELECT 'Error' AS status;
        END;

        START TRANSACTION;

        UPDATE projects SET status = 'approved' WHERE id = p_project_id;

        INSERT INTO approval_logs (project_id, user_id, action, created_at, updated_at)
        VALUES (p_project_id, (SELECT user_id FROM projects WHERE id = p_project_id), 'approved', NOW(), NOW());

        COMMIT;

        SELECT 'Success' AS status;
    END;
    ";

    DB::unprepared("DROP PROCEDURE IF EXISTS sp_approve_project");
    DB::unprepared($procedure);
    //     Schema::create('approve_project_procedure', function (Blueprint $table) {
    //         $table->id();
    //         $table->timestamps();
    //     });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS sp_approve_project");
        // Schema::dropIfExists('approve_project_procedure');
    }
};
