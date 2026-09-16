<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    // Page UI for Staff Module
    public function index(Request $request)
    {
        $query = User::whereIn('role', [
            'admin',
            'nurse',
            'midwife',
            'bhw',
        ]);

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $staff = $query
            ->latest()
            ->get();

        return inertia('staff/index', [
            'staff' => $staff,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'status' => $request->status,
            ],
        ]);
    }

    // Shows staff details
    public function show(User $user)
    {
        $user->loadMissing('accountRole');

        $hasPendingReset = \App\Models\PasswordResetRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        return inertia('staff/show', [
            'staff' => $user,
            'hasPendingReset' => $hasPendingReset,
        ]);
    }

    // Creates a new staff member
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'confirmed',
                'min:8',
            ],

            'role' => [
                'required',
                'in:admin,nurse,midwife,bhw',
            ],
        ]);

        $roleIdMap = [
            'admin' => 1,
            'nurse' => 2,
            'midwife' => 3,
            'bhw' => 4,
        ];

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'role_id' => $roleIdMap[$validated['role']] ?? null,
            'status' => 'active',
            'account_status' => 'active',
        ]);

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff account created successfully.');
    }

    // Displays the edit form
    public function edit(User $user)
    {
        return inertia('staff/edit', [
            'staff' => $user,
        ]);
    }

    // Updates a staff account
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,' . $user->id,
            ],

            'role' => [
                'required',
                'in:admin,nurse,midwife,bhw',
            ],
        ]);

        $user->update($validated);

        return redirect()
            ->route('staff.show', $user->id)
            ->with('success', 'Staff account updated successfully.');
    }

    // Activates or deactivates a staff account
    public function toggleStatus(User $user)
    {
        if (auth()->id() === $user->id) {
            return redirect()
                ->back()
                ->with('error', 'You cannot deactivate your own account.');
        }

        $newStatus = (strtolower((string) $user->status) === 'active' || strtolower((string) $user->account_status) === 'active')
            ? 'inactive'
            : 'active';

        $user->update([
            'status' => $newStatus,
            'account_status' => $newStatus,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Staff account status updated successfully.');
    }

    // Generates a temporary password for a staff member
    public function resetPassword(User $user)
    {
        if (! auth()->user()?->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        $temporaryPassword = \Illuminate\Support\Str::password(
            length: 10,
            letters: true,
            numbers: true,
            symbols: false,
            spaces: false
        );

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $temporaryPassword) {
            $user->forceFill([
                'password' => Hash::make($temporaryPassword),
                'must_change_password' => true,
                'account_status' => 'temporary',
                'status' => 'active',
            ])->save();

            \App\Models\PasswordResetRequest::where('user_id', $user->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'resolved',
                    'resolved_by' => auth()->id(),
                    'resolved_at' => now(),
                ]);
        });

        return redirect()
            ->back()
            ->with('success', "A new temporary password has been generated for {$user->name}.")
            ->with('temporary_password', $temporaryPassword)
            ->with('temporary_password_user_name', $user->name);
    }
}