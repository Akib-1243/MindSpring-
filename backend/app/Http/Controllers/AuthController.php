<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        if (! Auth::attempt($credentials)) return response()->json(['message' => 'Invalid faculty credentials.'], 422);
        $user = $request->user();
        return response()->json(['user' => $user, 'token' => $user->createToken('faculty-portal')->plainTextToken]);
    }

    public function register(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:120', 'email' => 'required|email|unique:users', 'password' => 'required|string|min:8', 'department' => 'nullable|string|max:120']);
        $user = User::create($data);
        return response()->json(['user' => $user, 'token' => $user->createToken('faculty-portal')->plainTextToken], 201);
    }

    public function logout(Request $request) { $request->user()->currentAccessToken()?->delete(); return response()->noContent(); }
}
