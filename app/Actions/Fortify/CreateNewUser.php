<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'student_id'     => ['nullable', 'string', 'max:50'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'course_program' => ['nullable', 'string', 'max:100'],
            'year_level'     => ['nullable', 'string', 'max:50'],
        ])->validate();

        // Enforce Student role strictly; malicious role manipulation is ignored
        $user = User::create([
            'name'           => $input['name'],
            'email'          => $input['email'],
            'password'       => $input['password'],
            'role'           => 'student',
            'student_id'     => $input['student_id'] ?? null,
            'phone'          => $input['phone'] ?? null,
            'course_program' => $input['course_program'] ?? null,
            'year_level'     => $input['year_level'] ?? null,
            'status'         => 'active',
        ]);

        if (method_exists($user, 'syncRoles')) {
            $user->syncRoles(['Student']);
        } elseif (method_exists($user, 'assignRole')) {
            $user->assignRole('Student');
        }

        return $user;
    }
}
