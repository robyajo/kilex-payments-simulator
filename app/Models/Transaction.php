<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $merchant_id
 * @property string $order_id
 * @property float $gross_amount
 * @property string $payment_type
 * @property string|null $bank
 * @property string|null $va_number
 * @property string|null $bill_key
 * @property string|null $biller_code
 * @property string|null $payment_code
 * @property string|null $qr_string
 * @property string $transaction_status
 * @property string $fraud_status
 * @property string $status_code
 * @property string $status_message
 * @property string|null $custom_field1
 * @property string|null $custom_field2
 * @property string|null $custom_field3
 * @property array|null $customer_details
 * @property array|null $item_details
 * @property string|null $snap_token
 * @property Carbon $expired_at
 * @property Carbon|null $settlement_time
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class Transaction extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'merchant_id',
        'order_id',
        'gross_amount',
        'payment_type',
        'bank',
        'va_number',
        'bill_key',
        'biller_code',
        'payment_code',
        'qr_string',
        'transaction_status',
        'fraud_status',
        'status_code',
        'status_message',
        'custom_field1',
        'custom_field2',
        'custom_field3',
        'customer_details',
        'item_details',
        'snap_token',
        'expired_at',
        'settlement_time',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gross_amount' => 'decimal:2',
            'customer_details' => 'array',
            'item_details' => 'array',
            'expired_at' => 'datetime',
            'settlement_time' => 'datetime',
        ];
    }

    /**
     * Get the merchant that owns the transaction.
     */
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    /**
     * Get the webhook logs for the transaction.
     */
    public function webhookLogs(): HasMany
    {
        return $this->hasMany(WebhookLog::class)->orderByDesc('created_at');
    }

    /**
     * Check if transaction is expired.
     */
    public function isExpired(): bool
    {
        return $this->transaction_status === 'expire' || ($this->transaction_status === 'pending' && $this->expired_at->isPast());
    }
}
