# PowerShell script to replace console.log/warn/error/info with logger equivalents
# Run this from the project root: .\scripts\replace-console-logs.ps1

$files = @(
    "src/hooks/useWedding.ts",
    "src/hooks/useDashboard.ts",
    "src/hooks/useMoodboard.ts",
    "src/hooks/useTask.ts",
    "src/hooks/useAffiliate.ts",
    "src/app/tasks/page.tsx",
    "src/app/page.tsx",
    "src/store/vendorStore.ts",
    "src/components/tasks/TaskList.tsx",
    "src/lib/affiliateTracking.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    
    if (Test-Path $fullPath) {
        Write-Host "Processing $file..." -ForegroundColor Green
        
        # Read file content
        $content = Get-Content $fullPath -Raw
        
        # Check if logger is already imported
        if ($content -notmatch "import logger from '@/lib/logger'") {
            # Find the last import statement
            $lines = $content -split "`n"
            $lastImportIndex = -1
            
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "^import ") {
                    $lastImportIndex = $i
                }
            }
            
            if ($lastImportIndex -ge 0) {
                # Insert logger import after last import
                $lines = $lines[0..$lastImportIndex] + "import logger from '@/lib/logger'" + $lines[($lastImportIndex + 1)..($lines.Count - 1)]
                $content = $lines -join "`n"
            }
        }
        
        # Replace console.log with logger.log
        $content = $content -replace "console\.log\(", "logger.log("
        
        # Replace console.warn with logger.warn
        $content = $content -replace "console\.warn\(", "logger.warn("
        
        # Replace console.error with logger.error
        $content = $content -replace "console\.error\(", "logger.error("
        
        # Replace console.info with logger.info
        $content = $content -replace "console\.info\(", "logger.info("
        
        # Replace console.debug with logger.debug
        $content = $content -replace "console\.debug\(", "logger.debug("
        
        # Write back to file
        Set-Content -Path $fullPath -Value $content -NoNewline
        
        Write-Host "✅ Completed $file" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✨ All files processed!" -ForegroundColor Green
Write-Host "Console logs will now be silent in production." -ForegroundColor Green

