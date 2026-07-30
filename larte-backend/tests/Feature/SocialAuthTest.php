<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    public function test_providers_returns_unconfigured_when_credentials_missing(): void
    {
        Config::set('services.google.client_id', null);
        Config::set('services.google.client_secret', null);
        Config::set('services.google.redirect', null);
        Config::set('services.apple.client_id', null);
        Config::set('services.apple.redirect', null);

        $response = $this->getJson('/api/auth/providers');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.google', false)
            ->assertJsonPath('data.apple', false);
    }

    public function test_providers_returns_google_configured_when_credentials_present(): void
    {
        Config::set('services.google.client_id', 'test-google-client-id');
        Config::set('services.google.client_secret', 'test-google-client-secret');
        Config::set('services.google.redirect', 'http://127.0.0.1:8000/api/auth/google/callback');
        Config::set('services.apple.client_id', null);
        Config::set('services.apple.redirect', null);

        $response = $this->getJson('/api/auth/providers');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.google', true)
            ->assertJsonPath('data.apple', false);
    }

    public function test_google_redirect_rejects_when_not_configured(): void
    {
        Config::set('services.google.client_id', null);
        Config::set('services.google.client_secret', null);
        Config::set('services.google.redirect', null);

        $response = $this->get('/api/auth/google/redirect');

        $response->assertRedirect();
        $this->assertStringContainsString('error=', $response->headers->get('Location'));
    }
}
