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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Used directly as transaction_id (UUID format)
            $table->foreignUuid('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->string('order_id')->index();
            $table->decimal('gross_amount', 14, 2);
            $table->string('payment_type'); // bank_transfer, qris, gopay, shopeepay, cstore
            $table->string('bank')->nullable(); // bca, bni, bri, permata, mandiri (echannel)
            $table->string('va_number')->nullable();
            $table->string('bill_key')->nullable();
            $table->string('biller_code')->nullable();
            $table->string('payment_code')->nullable();
            $table->text('qr_string')->nullable();
            $table->string('transaction_status')->default('pending')->index(); // pending, settlement, expire, cancel, deny
            $table->string('fraud_status')->default('accept');
            $table->string('status_code')->default('201');
            $table->string('status_message');
            $table->string('custom_field1')->nullable();
            $table->string('custom_field2')->nullable();
            $table->string('custom_field3')->nullable();
            $table->json('customer_details')->nullable();
            $table->json('item_details')->nullable();
            $table->string('snap_token')->nullable()->unique()->index();
            $table->timestamp('expired_at')->index();
            $table->timestamp('settlement_time')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
