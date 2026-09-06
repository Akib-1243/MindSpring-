<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });

        $now = now();
        DB::table('departments')->insert([
            ['code' => 'CSE', 'name' => 'Computer Science and Engineering', 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'EEE', 'name' => 'Electrical and Electronics Engineering', 'created_at' => $now, 'updated_at' => $now],
        ]);

        $departments = DB::table('departments')->pluck('id', 'code');
        DB::table('courses')->where('code', 'like', 'CSE%')->update(['department_id' => $departments['CSE']]);
        DB::table('courses')->where('code', 'like', 'EEE%')->update(['department_id' => $departments['EEE']]);
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
        });
        Schema::dropIfExists('departments');
    }
};
