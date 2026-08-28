import JSZip from 'jszip';
import { LARAVEL_PROJECT_FILES } from '../data/laravelProjectFiles';

export async function generateLaravelZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('tsp-laravel-cpanel-lamp') || zip;

  for (const file of LARAVEL_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  // Add additional directories to mirror standard Laravel 11 structure
  root.file('bootstrap/app.php', `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
`);

  root.file('routes/console.php', `<?php

use Illuminate\\Foundation\\Inspiring;
use Illuminate\\Support\\Facades\\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
`);

  root.file('public/index.php', `<?php

use Illuminate\\Http\\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
`);

  root.file('README.md', `# Federal Thrift Savings Plan (TSP.gov) - Laravel 11 LAMP Stack Edition

This archive contains the complete Laravel 11 PHP application for the Thrift Savings Plan Portal, optimized for deployment to cPanel shared hosting and standard LAMP stack servers (Linux, Apache, MySQL, PHP 8.2+).

Refer to \`INSTALLATION_GUIDE.md\` inside this package for step-by-step instructions.
`);

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  return content;
}

export async function downloadLaravelZip() {
  try {
    const blob = await generateLaravelZip();
    downloadBlob(blob, 'tsp-laravel-cpanel-lamp.zip');
  } catch (err) {
    console.error('Failed to generate Laravel ZIP:', err);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
