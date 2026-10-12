<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('securecampus:status', function (): void {
    $this->comment('SecureCampus is ready.');
})->purpose('Display the SecureCampus application status');
