<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Support\UserStatus;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use RuntimeException;

class SocialAuthService
{
    /** @var list<string> */
    public const PROVIDERS = ['google', 'apple'];

    public function redirect(string $provider): \Symfony\Component\HttpFoundation\RedirectResponse
    {
        $this->assertProvider($provider);

        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * @return array{user: User, token: string}
     */
    public function authenticate(string $provider, ?string $ip = null): array
    {
        $this->assertProvider($provider);

        /** @var SocialiteUser $socialUser */
        $socialUser = Socialite::driver($provider)->stateless()->user();
        $user = $this->findOrCreateUser($socialUser);

        if (! UserStatus::canAuthenticate($user->status)) {
            throw new RuntimeException('Ce compte est désactivé ou suspendu. Contactez un administrateur.');
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->markOnline($ip);

        ActivityLogger::log(
            module: 'auth',
            action: 'oauth_login',
            description: sprintf('OAuth login via %s for %s', $provider, $user->email),
            level: 'info',
            status: 'success',
            userId: $user->id,
            ip: $ip,
        );

        return [
            'user' => $user->fresh()->load('role.permissions'),
            'token' => $token,
        ];
    }

    public function isConfigured(string $provider): bool
    {
        if (! in_array($provider, self::PROVIDERS, true)) {
            return false;
        }

        return match ($provider) {
            'google' => filled(config('services.google.client_id')) && filled(config('services.google.client_secret')),
            'apple' => filled(config('services.apple.client_id'))
                && (
                    filled(config('services.apple.client_secret'))
                    || (
                        filled(config('services.apple.key_id'))
                        && filled(config('services.apple.team_id'))
                        && filled(config('services.apple.private_key'))
                    )
                ),
            default => false,
        };
    }

    private function findOrCreateUser(SocialiteUser $socialUser): User
    {
        $email = $socialUser->getEmail();

        if (! $email) {
            throw new RuntimeException('Le fournisseur OAuth n\'a pas fourni d\'adresse email.');
        }

        $existing = User::where('email', $email)->first();

        if ($existing) {
            if ($socialUser->getAvatar() && ! $existing->avatar) {
                $existing->update(['avatar' => $socialUser->getAvatar()]);
            }

            return $existing;
        }

        $name = trim((string) $socialUser->getName());
        $parts = $name !== '' ? preg_split('/\s+/', $name, 2) : ['User', ''];
        $defaultRole = Role::where('name', config('services.oauth.default_role', 'viewer'))->first();

        return User::create([
            'first_name' => $parts[0] ?? 'User',
            'last_name' => $parts[1] ?? '',
            'email' => $email,
            'password' => Hash::make(Str::random(48)),
            'role_id' => $defaultRole?->id,
            'status' => UserStatus::ACTIVE,
            'avatar' => $socialUser->getAvatar(),
        ]);
    }

    private function assertProvider(string $provider): void
    {
        if (! in_array($provider, self::PROVIDERS, true)) {
            throw new RuntimeException('Fournisseur OAuth non supporté.');
        }

        if (! $this->isConfigured($provider)) {
            throw new RuntimeException('La connexion ' . ucfirst($provider) . ' n\'est pas configurée.');
        }
    }
}
