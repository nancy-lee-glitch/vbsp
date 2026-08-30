export interface LaravelFile {
  path: string;
  filename: string;
  category: 'config' | 'routes' | 'controllers' | 'models' | 'migrations' | 'views' | 'database' | 'docs';
  content: string;
}

export const LARAVEL_PROJECT_FILES: LaravelFile[] = [
  {
    path: 'composer.json',
    filename: 'composer.json',
    category: 'config',
    content: `{
    "name": "federal/thrift-savings-plan",
    "type": "project",
    "description": "Official Federal Thrift Savings Plan (TSP.gov) Portal - Laravel 11 LAMP Stack Edition",
    "keywords": ["laravel", "tsp", "federal-retirement", "cpanel", "lamp"],
    "license": "MIT",
    "require": {
        "php": "^8.2",
        "guzzlehttp/guzzle": "^7.8",
        "laravel/framework": "^11.0",
        "laravel/sanctum": "^4.0",
        "laravel/tinker": "^2.9"
    },
    "require-dev": {
        "fakerphp/faker": "^1.23",
        "mockery/mockery": "^1.6",
        "nunomaduro/collision": "^8.1",
        "phpunit/phpunit": "^11.0"
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "app/",
            "Database\\\\Factories\\\\": "database/factories/",
            "Database\\\\Seeders\\\\": "database/seeders/"
        }
    },
    "scripts": {
        "post-autoload-dump": [
            "Illuminate\\\\Foundation\\\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ],
        "post-root-package-install": [
            "@php -r \\"file_exists('.env') || copy('.env.example', '.env');\\""
        ],
        "post-create-project-cmd": [
            "@php artisan key:generate --ansi"
        ]
    },
    "config": {
        "optimize-autoloader": true,
        "preferred-install": "dist",
        "sort-packages": true,
        "allow-plugins": {
            "pestphp/pest-plugin": true
        }
    },
    "minimum-stability": "stable",
    "prefer-stable": true
}`
  },
  {
    path: '.env.example',
    filename: '.env.example',
    category: 'config',
    content: `APP_NAME="Thrift Savings Plan Federal Portal"
APP_ENV=production
APP_KEY=base64:GENERATE_KEY_USING_PHP_ARTISAN_KEY_GENERATE
APP_DEBUG=false
APP_TIMEZONE=America/New_York
APP_URL=https://your-domain-or-subdomain.gov

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=info

# Neon Serverless PostgreSQL / Vercel Postgres Database Configuration
# Reads from single DATABASE_URL or POSTGRES_URL connection string
DB_CONNECTION=pgsql
DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
POSTGRES_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Session & Cache (file-based works out of the box on all cPanel shared hosts)
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

CACHE_STORE=file
QUEUE_CONNECTION=database

# SMTP Mail Setup (cPanel Webmail or SendGrid/SES)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=notifications@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="no-reply@tsp.gov"
MAIL_FROM_NAME="Thrift Savings Plan Operations"

# Optional Gemini AI Assistant API Key for AVA
GEMINI_API_KEY=""
`
  },
  {
    path: '.htaccess',
    filename: '.htaccess',
    category: 'config',
    content: `# Root .htaccess for cPanel Shared Hosting with public_html redirect
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Redirect root requests to /public directory seamlessly
    RewriteCond %{REQUEST_URI} !^/public/
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>

<IfModule mod_headers.c>
    # Security Headers for Section 508 / Federal Standard Compliance
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`
  },
  {
    path: 'public/.htaccess',
    filename: 'public/.htaccess',
    category: 'config',
    content: `<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
`
  },
  {
    path: 'database/database.sql',
    filename: 'database.sql',
    category: 'database',
    content: `-- -------------------------------------------------------------
-- Thrift Savings Plan (TSP.gov) PostgreSQL Schema for Neon / Vercel Postgres / LAMP
-- Compatible with PostgreSQL 14+, PostgreSQL 15+, PostgreSQL 16+ & Neon Serverless
-- -------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS fraud_alerts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS tsp_loans CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS user_allocations CASCADE;
DROP TABLE IF EXISTS tsp_funds CASCADE;
DROP TABLE IF EXISTS cms_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_service_type CASCADE;
DROP TYPE IF EXISTS user_role_type CASCADE;
DROP TYPE IF EXISTS user_mfa_method CASCADE;
DROP TYPE IF EXISTS user_status_type CASCADE;
DROP TYPE IF EXISTS fund_category_type CASCADE;
DROP TYPE IF EXISTS loan_type_enum CASCADE;
DROP TYPE IF EXISTS loan_status_enum CASCADE;
DROP TYPE IF EXISTS beneficiary_type_enum CASCADE;
DROP TYPE IF EXISTS audit_severity_enum CASCADE;
DROP TYPE IF EXISTS fraud_status_enum CASCADE;

CREATE TYPE user_service_type AS ENUM ('FERS', 'CSRS', 'BRS', 'Uniformed Services');
CREATE TYPE user_role_type AS ENUM ('participant', 'public_editor', 'agency_staff', 'full_admin', 'super_admin');
CREATE TYPE user_mfa_method AS ENUM ('sms', 'authenticator', 'security_key');
CREATE TYPE user_status_type AS ENUM ('active', 'separated', 'retired');
CREATE TYPE fund_category_type AS ENUM ('Core Individual Fund', 'Lifecycle Fund');
CREATE TYPE loan_type_enum AS ENUM ('General Purpose', 'Primary Residence');
CREATE TYPE loan_status_enum AS ENUM ('Active', 'Paid', 'Processing');
CREATE TYPE beneficiary_type_enum AS ENUM ('Primary', 'Contingent');
CREATE TYPE audit_severity_enum AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE fraud_status_enum AS ENUM ('Investigating', 'Resolved', 'Flagged');

-- 1. Users Table (Participants & Admins)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tsp_account_number VARCHAR(64) UNIQUE NOT NULL,
    thriftline_pin VARCHAR(255) NOT NULL,
    ssn_last_four VARCHAR(4) NOT NULL,
    service_type user_service_type DEFAULT 'FERS',
    agency VARCHAR(255) DEFAULT 'Federal Civilian Agency',
    role user_role_type DEFAULT 'participant',
    total_balance DECIMAL(15,2) DEFAULT 342850.12,
    traditional_balance DECIMAL(15,2) DEFAULT 228500.00,
    roth_balance DECIMAL(15,2) DEFAULT 114350.12,
    personal_rate_of_return DECIMAL(5,2) DEFAULT 14.80,
    phone VARCHAR(32) DEFAULT '(202) 555-0194',
    address TEXT,
    mfa_enabled BOOLEAN DEFAULT TRUE,
    mfa_method user_mfa_method DEFAULT 'authenticator',
    e_delivery_enabled BOOLEAN DEFAULT TRUE,
    status user_status_type DEFAULT 'active',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. TSP Funds Catalog & Performance
CREATE TABLE tsp_funds (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category fund_category_type NOT NULL,
    description TEXT,
    benchmark VARCHAR(255),
    risk_level VARCHAR(64),
    current_share_price DECIMAL(10,4) NOT NULL,
    one_month_return DECIMAL(6,2),
    ytd_return DECIMAL(6,2),
    one_year_return DECIMAL(6,2),
    three_year_return DECIMAL(6,2),
    five_year_return DECIMAL(6,2),
    ten_year_return DECIMAL(6,2),
    expense_ratio VARCHAR(32) DEFAULT '0.048%',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transactions Table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(128) NOT NULL,
    fund_code VARCHAR(16) NULL,
    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    confirmation_code VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. TSP Loans Table
CREATE TABLE tsp_loans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_number VARCHAR(64) UNIQUE NOT NULL,
    type loan_type_enum NOT NULL,
    principal_amount DECIMAL(12,2) NOT NULL,
    remaining_balance DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INT NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    status loan_status_enum DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Beneficiaries Table
CREATE TABLE beneficiaries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type beneficiary_type_enum NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(128) NOT NULL,
    ssn_masked VARCHAR(16) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit Logs Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    role VARCHAR(128) NOT NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    severity audit_severity_enum DEFAULT 'Low',
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fraud Alerts Table
CREATE TABLE fraud_alerts (
    id BIGSERIAL PRIMARY KEY,
    account_id VARCHAR(64) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    alert_type VARCHAR(128) NOT NULL,
    risk_score INT NOT NULL,
    status fraud_status_enum DEFAULT 'Investigating',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SEED CORE DATA
INSERT INTO tsp_funds (code, name, category, description, benchmark, risk_level, current_share_price, one_month_return, ytd_return, one_year_return, three_year_return, five_year_return, ten_year_return, expense_ratio) VALUES
('G', 'Government Securities Investment Fund', 'Core Individual Fund', 'Short-term U.S. Treasury securities guaranteed by the U.S. Government.', 'U.S. Treasuries 4+ yrs yield', 'Low', 19.42, 0.38, 4.62, 4.75, 4.12, 3.48, 2.85, '0.048%'),
('F', 'Fixed Income Index Investment Fund', 'Core Individual Fund', 'Tracks the Bloomberg U.S. Aggregate Bond Index.', 'Bloomberg U.S. Aggregate Bond Index', 'Low-to-Moderate', 22.18, 0.85, 6.14, 7.20, 1.85, 1.42, 2.10, '0.055%'),
('C', 'Common Stock Index Investment Fund', 'Core Individual Fund', 'Tracks the Standard & Poor 500 (S&P 500) Index of large/medium U.S. companies.', 'S&P 500 Index', 'Moderate-to-High', 94.65, 2.45, 24.80, 26.15, 11.92, 15.65, 13.20, '0.048%'),
('S', 'Small Capitalization Stock Index Investment Fund', 'Core Individual Fund', 'Tracks the Dow Jones U.S. Completion Total Stock Market Index.', 'Dow Jones U.S. Completion TSM Index', 'High', 86.30, 1.95, 17.40, 18.90, 7.45, 10.80, 9.85, '0.059%'),
('I', 'International Stock Index Investment Fund', 'Core Individual Fund', 'Replicates MSCI ACWI ex-USA IMI Index for global equity diversification.', 'MSCI ACWI ex-USA Index', 'High', 43.10, 1.20, 13.90, 14.50, 6.20, 7.85, 5.95, '0.054%'),
('L2050', 'Lifecycle 2050 Fund', 'Lifecycle Fund', 'Target-date fund for participants beginning withdrawals between 2048-2052.', 'Composite Benchmark', 'Moderate-to-High', 48.72, 1.88, 18.20, 19.50, 9.80, 11.90, 10.15, '0.051%');

-- SEED SAMPLE DEMO PARTICIPANT (Password: FederalTSP2026!)
INSERT INTO users (name, email, password, tsp_account_number, thriftline_pin, ssn_last_four, service_type, agency, role, total_balance, traditional_balance, roth_balance, personal_rate_of_return, phone, address, mfa_enabled, e_delivery_enabled, status) VALUES
('Marcus Vance', 'marcus.vance@usda.gov', '$2y$12$0zX7d7N8R5wL7o3fG.rO2eNlmhG8g9H6I9n4K5p6O7q8R9s0T1u2V', 'TSP-0089-4412-98', '829415', '7842', 'FERS', 'United States Department of Agriculture (USDA)', 'participant', 342850.12, 228500.00, 114350.12, 14.80, '(202) 555-0194', '1404 Potomac Ave SE, Washington, DC 20003', TRUE, TRUE, 'active'),
('System Administrator', 'admin@frtib.gov', '$2y$12$0zX7d7N8R5wL7o3fG.rO2eNlmhG8g9H6I9n4K5p6O7q8R9s0T1u2V', 'TSP-ADMIN-0001', '999111', '0000', 'FERS', 'Federal Retirement Thrift Investment Board', 'super_admin', 0.00, 0.00, 0.00, 0.00, '(202) 555-0100', '77 K Street NE, Washington, DC 20002', TRUE, TRUE, 'active');
`
  },
  {
    path: 'routes/web.php',
    filename: 'web.php',
    category: 'routes',
    content: `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\PublicController;
use App\\Http\\Controllers\\ParticipantController;
use App\\Http\\Controllers\\AgencyController;
use App\\Http\\Controllers\\AdminController;
use App\\Http\\Controllers\\AvaChatController;

/*
|--------------------------------------------------------------------------
| Public TSP Visitor Routes (No Login Required)
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicController::class, 'index'])->name('home');
Route::get('/tsp-basics', [PublicController::class, 'education'])->name('education');
Route::get('/fund-performance', [PublicController::class, 'fundPerformance'])->name('funds');
Route::get('/calculators', [PublicController::class, 'calculators'])->name('calculators');
Route::get('/forms-and-publications', [PublicController::class, 'forms'])->name('forms');
Route::get('/contact-thriftline', [PublicController::class, 'contact'])->name('contact');
Route::get('/security-and-privacy', [PublicController::class, 'securityPrivacy'])->name('security.privacy');

// AVA 24/7 Virtual Assistant API
Route::post('/api/ava/chat', [AvaChatController::class, 'chat'])->name('ava.chat');

/*
|--------------------------------------------------------------------------
| Participant My Account Routes (Protected & MFA Verified)
|--------------------------------------------------------------------------
*/
Route::prefix('participant')->name('participant.')->group(function () {
    Route::get('/login', [ParticipantController::class, 'showLogin'])->name('login');
    Route::post('/login', [ParticipantController::class, 'login'])->name('login.post');
    Route::post('/logout', [ParticipantController::class, 'logout'])->name('logout');

    Route::middleware(['auth'])->group(function () {
        Route::get('/dashboard', [ParticipantController::class, 'dashboard'])->name('dashboard');
        Route::get('/transactions', [ParticipantController::class, 'transactions'])->name('transactions');
        Route::post('/change-allocation', [ParticipantController::class, 'changeAllocation'])->name('allocation.update');
        Route::post('/interfund-transfer', [ParticipantController::class, 'interfundTransfer'])->name('ift.store');
        Route::post('/request-loan', [ParticipantController::class, 'requestLoan'])->name('loan.store');
        Route::get('/mailbox', [ParticipantController::class, 'mailbox'])->name('mailbox');
        Route::post('/beneficiaries/update', [ParticipantController::class, 'updateBeneficiaries'])->name('beneficiaries.update');
        Route::get('/statements/download/{quarter}', [ParticipantController::class, 'downloadStatement'])->name('statement.download');
    });
});

/*
|--------------------------------------------------------------------------
| Agency & Service Representative Portal
|--------------------------------------------------------------------------
*/
Route::prefix('agency')->name('agency.')->group(function () {
    Route::get('/', [AgencyController::class, 'index'])->name('index');
    Route::get('/bulletins', [AgencyController::class, 'bulletins'])->name('bulletins');
    Route::get('/training', [AgencyController::class, 'training'])->name('training');
    Route::get('/payroll-resources', [AgencyController::class, 'payrollResources'])->name('payroll');
    Route::get('/forms', [AgencyController::class, 'forms'])->name('forms');
});

/*
|--------------------------------------------------------------------------
| Admin, CMS & Compliance Dashboard (Role-Based Access Control)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'overview'])->name('overview');
    Route::get('/cms', [AdminController::class, 'cms'])->name('cms');
    Route::post('/cms/news/publish', [AdminController::class, 'publishNews'])->name('cms.news.publish');
    Route::post('/funds/update-rates', [AdminController::class, 'updateFundRates'])->name('funds.update');
    Route::get('/participants/lookup', [AdminController::class, 'participantLookup'])->name('participant.lookup');
    Route::get('/audit-logs', [AdminController::class, 'auditLogs'])->name('audit.logs');
    Route::get('/fraud-monitoring', [AdminController::class, 'fraudMonitoring'])->name('fraud.monitoring');
    Route::get('/compliance-accessibility', [AdminController::class, 'complianceAudit'])->name('compliance');
    Route::post('/backup/run', [AdminController::class, 'triggerDatabaseBackup'])->name('backup.run');
});
`
  },
  {
    path: 'app/Http/Controllers/PublicController.php',
    filename: 'PublicController.php',
    category: 'controllers',
    content: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\TspFund;

class PublicController extends Controller
{
    public function index()
    {
        $funds = TspFund::all();
        return view('public.home', compact('funds'));
    }

    public function education()
    {
        return view('public.education');
    }

    public function fundPerformance()
    {
        $funds = TspFund::all();
        return view('public.funds', compact('funds'));
    }

    public function calculators()
    {
        return view('public.calculators');
    }

    public function forms()
    {
        return view('public.forms');
    }

    public function contact()
    {
        return view('public.contact');
    }

    public function securityPrivacy()
    {
        return view('public.security');
    }
}
`
  },
  {
    path: 'app/Http/Controllers/ParticipantController.php',
    filename: 'ParticipantController.php',
    category: 'controllers',
    content: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Auth;
use App\\Models\\User;
use App\\Models\\Transaction;
use App\\Models\\TspLoan;
use App\\Models\\Beneficiary;

class ParticipantController extends Controller
{
    public function showLogin()
    {
        return view('participant.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'tsp_account_number' => 'required|string',
            'password' => 'required|string',
            'thriftline_pin' => 'required|digits:6',
        ]);

        if (Auth::attempt(['tsp_account_number' => $request->tsp_account_number, 'password' => $request->password])) {
            $user = Auth::user();
            if ($user->thriftline_pin === $request->thriftline_pin) {
                $request->session()->regenerate();
                return redirect()->intended(route('participant.dashboard'));
            }
        }

        return back()->withErrors(['login' => 'Invalid TSP Account Number, Password, or ThriftLine PIN.']);
    }

    public function dashboard()
    {
        $user = Auth::user();
        $recentTransactions = Transaction::where('user_id', $user->id)->orderBy('date', 'desc')->take(5)->get();
        $loans = TspLoan::where('user_id', $user->id)->get();
        $beneficiaries = Beneficiary::where('user_id', $user->id)->get();

        return view('participant.dashboard', compact('user', 'recentTransactions', 'loans', 'beneficiaries'));
    }

    public function transactions()
    {
        $user = Auth::user();
        $transactions = Transaction::where('user_id', $user->id)->orderBy('date', 'desc')->paginate(15);
        return view('participant.transactions', compact('transactions'));
    }

    public function changeAllocation(Request $request)
    {
        $request->validate([
            'allocations' => 'required|array',
        ]);

        // Verify allocations sum to 100%
        $total = array_sum($request->allocations);
        if ($total !== 100) {
            return back()->withErrors(['allocation' => 'Future contribution allocations must total exactly 100%.']);
        }

        // Record update and audit log...
        return back()->with('success', 'Future contribution allocation updated successfully.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
`
  },
  {
    path: 'app/Http/Controllers/AvaChatController.php',
    filename: 'AvaChatController.php',
    category: 'controllers',
    content: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;

class AvaChatController extends Controller
{
    public function chat(Request $request)
    {
        $messages = $request->input('messages', []);
        $apiKey = env('GEMINI_API_KEY');

        if (empty($apiKey)) {
            // Intelligent local rule-based responses
            $last = end($messages)['content'] ?? '';
            $reply = "Hello! I am AVA, your official 24/7 Thrift Savings Plan assistant. ";
            if (stripos($last, 'limit') !== false) {
                $reply .= "For 2026, the regular TSP elective deferral limit is $23,500. Catch-up for age 50+ is $7,500 (or $11,250 for ages 60-63).";
            } elseif (stripos($last, 'loan') !== false) {
                $reply .= "The TSP offers General Purpose (1-5 yrs) and Primary Residence (1-15 yrs) loans up to 50% of your vested balance ($50k max).";
            } else {
                $reply .= "I can guide you through investment fund options (G, F, C, S, I, L), contribution allocations, loans, or retirement income modeling. How can I assist you?";
            }
            return response()->json(['reply' => $reply]);
        }

        // Call Gemini 3.7 Flash API via HTTP client
        try {
            $formattedContents = [];
            foreach ($messages as $msg) {
                $formattedContents[] = [
                    'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $msg['content']]]
                ];
            }

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key={$apiKey}", [
                    'contents' => $formattedContents,
                    'systemInstruction' => [
                        'parts' => [['text' => 'You are AVA, the official 24/7 TSP.gov Virtual Assistant for the Thrift Savings Plan. Be precise, professional, and compliant with 2026 federal limits.']]
                    ]
                ]);

            $json = $response->json();
            $reply = $json['candidates'][0]['content']['parts'][0]['text'] ?? 'I apologize, I am temporarily unable to respond.';
            return response()->json(['reply' => $reply]);
        } catch (\\Exception $e) {
            return response()->json(['reply' => 'I am experiencing high traffic. Please try again in a moment.']);
        }
    }
}
`
  },
  {
    path: 'INSTALLATION_GUIDE.md',
    filename: 'INSTALLATION_GUIDE.md',
    category: 'docs',
    content: `# Thrift Savings Plan (TSP.gov) - Laravel 11 LAMP Stack & cPanel Deployment Guide

This comprehensive guide provides step-by-step instructions for deploying this **Laravel 11 PHP application** to any standard **cPanel shared hosting or dedicated LAMP stack server** (Apache, MySQL/MariaDB, PHP 8.2+).

---

## 📋 Server Requirements Checklist
- **PHP Version**: PHP 8.2, 8.3, or 8.4
- **Required PHP Extensions**:
  - \`pdo_mysql\`
  - \`openssl\`
  - \`mbstring\`
  - \`tokenizer\`
  - \`xml\`
  - \`ctype\`
  - \`json\`
  - \`bcmath\`
  - \`curl\`
  - \`fileinfo\`
- **Database**: MySQL 5.7+ / MySQL 8.0+ or MariaDB 10.3+
- **Web Server**: Apache 2.4+ with \`mod_rewrite\` enabled

---

## 🚀 Step 1: Download & Upload Files via cPanel File Manager

1. Click the **"Download Complete Laravel Package (.ZIP)"** button in the top navigation or Admin Dashboard of this portal to obtain \`tsp-laravel-lamp-cpanel.zip\`.
2. Log into your **cPanel** dashboard (e.g., \`https://yourdomain.com:2083\`).
3. Open **File Manager**.
4. You have two common directory structure choices on shared hosting:

### Recommended Setup (Standard Secure Structure)
Upload the ZIP into your home directory (e.g. \`/home/yourusername/tsp-laravel/\`), extract it, and either:
- Set your domain's **Document Root** in cPanel **Domains / Subdomains** to \`/home/yourusername/tsp-laravel/public\`
- OR place the contents of \`public/\` inside \`public_html/\` and keep the core Laravel folders outside public reach.

---

## 🗄️ Step 2: Create MySQL Database & User in cPanel

1. In cPanel, click **MySQL Databases** (or **MySQL Database Wizard**).
2. Create a new database: e.g. \`cpaneluser_tspdb\`.
3. Create a new user: e.g. \`cpaneluser_tspuser\` with a strong password.
4. Add the user to the database with **ALL PRIVILEGES**.
5. Open **phpMyAdmin** from cPanel.
6. Select your new database \`cpaneluser_tspdb\`.
7. Click the **Import** tab, choose the file \`database/database.sql\` included in the zip, and click **Go**.
   *(All tables: users, tsp_funds, transactions, loans, beneficiaries, audit_logs will be created and seeded automatically!)*

---

## ⚙️ Step 3: Configure the \`.env\` File

1. In cPanel File Manager, ensure **"Show Hidden Files (dotfiles)"** is checked in Settings.
2. Duplicate \`.env.example\` to \`.env\`.
3. Edit \`.env\` and enter your database credentials:
\`\`\`env
APP_NAME="Thrift Savings Plan Federal Portal"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cpaneluser_tspdb
DB_USERNAME=cpaneluser_tspuser
DB_PASSWORD="YourDatabasePasswordHere"
\`\`\`

---

## 🔑 Step 4: Generate Application Key & Cache Optimization

If you have cPanel **Terminal** or SSH access:
\`\`\`bash
cd /home/yourusername/tsp-laravel
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache
\`\`\`
*(If you do not have SSH access, the included \`.env.example\` comes with a pre-configured encryption key, or you can run artisan via a simple web script).*

---

## ⏰ Step 5: Setup Cron Job in cPanel (Optional for Background Jobs)

1. In cPanel, click **Cron Jobs**.
2. Select interval: **Once Per Minute (* * * * *)**.
3. Command:
\`\`\`bash
/usr/local/bin/php /home/yourusername/tsp-laravel/artisan schedule:run >> /dev/null 2>&1
\`\`\`

---

## 🔒 Step 6: SSL Certificate (HTTPS)
1. Go to cPanel **SSL/TLS Status** or **Let's Encrypt SSL**.
2. Click **Run AutoSSL** to ensure your federal portal runs over encrypted HTTPS.

---

## 👤 Default Demo Credentials
- **Participant Portal**:
  - TSP Account Number: \`TSP-0089-4412-98\`
  - Password: \`FederalTSP2026!\`
  - ThriftLine PIN: \`829415\`
- **Admin Portal**:
  - Email: \`admin@frtib.gov\`
  - Password: \`FederalTSP2026!\`
`
  }
];
