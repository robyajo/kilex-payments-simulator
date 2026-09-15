<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->string('payment_providers')->default('midtrans')->after('merchant_code');
            $table->text('stripe_secret_key')->nullable()->after('error_url');
            $table->string('stripe_secret_key_hash')->nullable()->after('stripe_secret_key')->index();
            $table->text('stripe_publishable_key')->nullable()->after('stripe_secret_key');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->string('provider')->default('midtrans')->after('merchant_id')->index();
            $table->string('provider_reference')->nullable()->after('snap_token')->index();
            $table->text('provider_client_secret')->nullable()->after('provider_reference');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['provider']);
            $table->dropIndex(['provider_reference']);
            $table->dropColumn(['provider', 'provider_reference', 'provider_client_secret']);
        });

        Schema::table('merchants', function (Blueprint $table) {
            $table->dropColumn(['payment_providers', 'stripe_secret_key', 'stripe_secret_key_hash', 'stripe_publishable_key']);
        });
    }
};
