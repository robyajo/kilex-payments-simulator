<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Replace URLs persisted by the original demo seed with the configured app URL.
     */
    public function up(): void
    {
        $appUrl = rtrim(config('app.url'), '/');

        DB::table('merchants')
            ->where('finish_url', 'https://mituni.test/payment/success')
            ->update(['finish_url' => "{$appUrl}/payment/success"]);

        DB::table('merchants')
            ->where('unfinish_url', 'https://mituni.test/payment/pending')
            ->update(['unfinish_url' => "{$appUrl}/payment/pending"]);

        DB::table('merchants')
            ->where('error_url', 'https://mituni.test/payment/failed')
            ->update(['error_url' => "{$appUrl}/payment/failed"]);
    }

    /**
     * Restore the legacy demo URLs if this migration is rolled back.
     */
    public function down(): void
    {
        // Do not overwrite merchant URLs that may have been edited after the migration.
    }
};
