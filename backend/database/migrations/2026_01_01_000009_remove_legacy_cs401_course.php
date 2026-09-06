<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $courseId = DB::table('courses')->where('code', 'CS401')->value('id');
        if ($courseId) {
            DB::table('past_papers')->where('course_id', $courseId)->delete();
            DB::table('courses')->where('id', $courseId)->delete();
        }
    }

    public function down(): void
    {
        // The legacy demo course is intentionally not restored.
    }
};