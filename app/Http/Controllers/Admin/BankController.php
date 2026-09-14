<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BankController extends Controller
{
    /**
     * Display a listing of all Virtual Account banks.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $status = $request->query('status', 'all');

        $query = Bank::query()->orderBy('name', 'asc');

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('va_prefix', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $banks = $query->get()->map(function (Bank $bank) {
            return [
                'id' => $bank->id,
                'code' => $bank->code,
                'name' => $bank->name,
                'va_prefix' => $bank->va_prefix,
                'biller_code' => $bank->biller_code,
                'bill_key_prefix' => $bank->bill_key_prefix,
                'logo_url' => $bank->logo_url,
                'badge_color' => $bank->badge_color ?? 'blue',
                'is_active' => (bool) $bank->is_active,
                'instruction_atm' => $bank->instruction_atm,
                'instruction_mbanking' => $bank->instruction_mbanking,
                'instruction_ibanking' => $bank->instruction_ibanking,
                'created_at' => $bank->created_at?->toISOString(),
            ];
        });

        $totalBanks = Bank::count();
        $activeBanks = Bank::where('is_active', true)->count();

        return Inertia::render('admin/banks/index', [
            'banks' => $banks,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total' => $totalBanks,
                'active' => $activeBanks,
                'inactive' => $totalBanks - $activeBanks,
            ],
        ]);
    }

    /**
     * Store a newly created Virtual Account bank.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'alpha_dash', 'unique:banks,code'],
            'name' => ['required', 'string', 'max:100'],
            'va_prefix' => ['required', 'string', 'max:20'],
            'biller_code' => ['nullable', 'string', 'max:20'],
            'bill_key_prefix' => ['nullable', 'string', 'max:20'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'badge_color' => ['nullable', 'string', 'max:30'],
            'is_active' => ['boolean'],
            'instruction_atm' => ['nullable', 'string'],
            'instruction_mbanking' => ['nullable', 'string'],
            'instruction_ibanking' => ['nullable', 'string'],
        ]);

        $validated['code'] = strtolower(trim($validated['code']));
        $validated['is_active'] = $request->boolean('is_active', true);

        Bank::create($validated);

        return back()->with('success', "Bank {$validated['name']} berhasil ditambahkan.");
    }

    /**
     * Update the specified bank.
     */
    public function update(Request $request, Bank $bank): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'alpha_dash', Rule::unique('banks', 'code')->ignore($bank->id)],
            'name' => ['required', 'string', 'max:100'],
            'va_prefix' => ['required', 'string', 'max:20'],
            'biller_code' => ['nullable', 'string', 'max:20'],
            'bill_key_prefix' => ['nullable', 'string', 'max:20'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'badge_color' => ['nullable', 'string', 'max:30'],
            'is_active' => ['boolean'],
            'instruction_atm' => ['nullable', 'string'],
            'instruction_mbanking' => ['nullable', 'string'],
            'instruction_ibanking' => ['nullable', 'string'],
        ]);

        $validated['code'] = strtolower(trim($validated['code']));
        $validated['is_active'] = $request->boolean('is_active', true);

        $bank->update($validated);

        return back()->with('success', "Bank {$bank->name} berhasil diperbarui.");
    }

    /**
     * Toggle active state of the specified bank.
     */
    public function toggleActive(Bank $bank): RedirectResponse
    {
        $bank->update([
            'is_active' => ! $bank->is_active,
        ]);

        $statusText = $bank->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Bank {$bank->name} berhasil {$statusText}.");
    }

    /**
     * Remove the specified bank from storage (soft delete).
     */
    public function destroy(Bank $bank): RedirectResponse
    {
        $name = $bank->name;
        $bank->delete();

        return back()->with('success', "Bank {$name} berhasil dihapus.");
    }
}
