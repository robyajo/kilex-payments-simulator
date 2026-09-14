<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property string $id
 * @property string $merchant_id
 * @property string $server_key
 * @property string $client_key
 * @property bool $is_production
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class ApiKey extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'merchant_id',
        'server_key',
        'client_key',
        'is_production',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_production' => 'boolean',
        ];
    }

    /**
     * Get the merchant that owns the API key.
     */
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    /**
     * Generate Midtrans-formatted Server Key.
     */
    public static function generateServerKey(): string
    {
        return 'SB-Mid-server-'.Str::random(24);
    }

    /**
     * Generate Midtrans-formatted Client Key.
     */
    public static function generateClientKey(): string
    {
        return 'SB-Mid-client-'.Str::random(24);
    }
}
