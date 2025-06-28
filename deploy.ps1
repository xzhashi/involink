# This script will log out from Supabase Cloud and then try to deploy to your Coolify server.

Write-Host "-----------------------------------------------------"
Write-Host "STEP 1: Forcing logout from Supabase Cloud..." -ForegroundColor Yellow
supabase logout

Write-Host "-----------------------------------------------------"
Write-Host "STEP 2: Setting up environment for Coolify..." -ForegroundColor Yellow

# --- IMPORTANT: REPLACE THE VALUES BELOW ---
$env:SUPABASE_PROJECT_URL="https://linkfcinv.brandsscaler.com/"
$env:SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDkyNDAyMCwiZXhwIjo0OTA2NTk3NjIwLCJyb2xlIjoiYW5vbiJ9.iyegAqufgTE3eQTKtJTR4HDrx24aZhjM2m1aOgRMeMI"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1MDkyNDAyMCwiZXhwIjo0OTA2NTk3NjIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.ldR_uh55UifYeGugEq4M0_9GMBwt-WTaTIGJ9zgVX3I"
$functionToDeploy = "create-razorpay-order"
# ---------------------------------------------

Write-Host "URL set to: $($env:SUPABASE_PROJECT_URL)"
Write-Host "Deploying function: $($functionToDeploy)"

Write-Host "-----------------------------------------------------"
Write-Host "STEP 3: Attempting to deploy to Coolify with debug..." -ForegroundColor Yellow
supabase --debug functions deploy $functionToDeploy --no-verify-jwt

Write-Host "-----------------------------------------------------"
Write-Host "Script finished. Press Enter to exit." -ForegroundColor Green
Read-Host