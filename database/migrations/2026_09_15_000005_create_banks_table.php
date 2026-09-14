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
        Schema::create('banks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique(); // e.g. bca, bni, bri, mandiri, permata, cimb, bsi, danamon
            $table->string('name'); // e.g. Bank Central Asia
            $table->string('va_prefix'); // e.g. 70014
            $table->string('biller_code')->nullable(); // For Mandiri / echannel (e.g. 70012)
            $table->string('bill_key_prefix')->nullable(); // e.g. 99
            $table->string('logo_url')->nullable(); // Image URL or SVG identifier
            $table->string('badge_color')->nullable()->default('blue'); // UI theme color
            $table->boolean('is_active')->default(true);
            $table->text('instruction_atm')->nullable();
            $table->text('instruction_mbanking')->nullable();
            $table->text('instruction_ibanking')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};
