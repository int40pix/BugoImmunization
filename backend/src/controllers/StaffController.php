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
        return inertia('staff/show', [
            'staff' => $user,
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
                'in:nurse,midwife,bhw',
            ],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
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
        $user->update([
            'status' => $user->status === 'active'
                ? 'inactive'
                : 'active',
        ]);

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff account status updated successfully.');
    }
}