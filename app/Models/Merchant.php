<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property int $user_id
 * @property string $name
 * @property string $merchant_code
 * @property string|null $notification_url
 * @property string|null $finish_url
 * @property string|null $unfinish_url
 * @property string|null $error_url
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class Merchant extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'merchant_code',
        'notification_url',
        'finish_url',
        'unfinish_url',
        'error_url',
    ];

    /**
     * Get the user that owns the merchant.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the API keys for the merchant.
     */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    /**
     * Get the active primary API key for the merchant.
     */
    public function primaryApiKey(): HasOne
    {
        return $this->hasOne(ApiKey::class)->oldestOfMany();
    }

    /**
     * Get the transactions for the merchant.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the webhook logs for the merchant.
     */
    public function webhookLogs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    /**
     * Ensure merchant has active API keys, generating if missing.
     */
    public function getOrCreateApiKey(): ApiKey
    {
        $key = $this->apiKeys()->first();

        if (! $key) {
            $key = $this->apiKeys()->create([
                'server_key' => ApiKey::generateServerKey(),
                'client_key' => ApiKey::generateClientKey(),
                'is_production' => false,
            ]);
        }

        return $key;
    }
}
