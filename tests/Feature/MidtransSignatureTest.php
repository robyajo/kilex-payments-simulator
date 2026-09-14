<?php

use App\Services\MidtransSignatureService;

test('it accurately calculates midtrans sha512 signature key', function () {
    $service = new MidtransSignatureService;

    $orderId = 'ORDER-101';
    $statusCode = '200';
    $grossAmount = '150000.00';
    $serverKey = 'SB-Mid-server-testkey123';

    $expectedHash = hash('sha512', 'ORDER-101200150000.00SB-Mid-server-testkey123');
    $generatedHash = $service->generate($orderId, $statusCode, $grossAmount, $serverKey);

    expect($generatedHash)->toBe($expectedHash)
        ->and($service->verify($generatedHash, $orderId, $statusCode, $grossAmount, $serverKey))->toBeTrue();
});
