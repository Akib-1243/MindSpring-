<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("UPDATE courses c JOIN users u ON u.id = c.user_id JOIN departments d ON d.name = u.department SET c.department_id = d.id WHERE c.department_id IS NULL");
    }

    public function down(): void
    {
        // Department ownership is required and is not removed on rollback.
    }
};
