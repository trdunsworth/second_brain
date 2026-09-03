@echo off
REM Ollama Status Check - Windows CMD
REM Checks Ollama connectivity, lists models, verifies required models.
REM
REM Usage:
REM   Ollama-Status.cmd              Check status
REM   Ollama-Status.cmd --pull       Also pull missing models

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "CONFIG=%SCRIPT_DIR%ollama-models.json"
set "PULL_MISSING=false"

if "%~1"=="--pull" set "PULL_MISSING=true"

REM Check config exists
if not exist "%CONFIG%" (
    echo Config not found: %CONFIG%
    exit /b 1
)

echo === Ollama Status ===
echo.

REM Check if Ollama is running
echo Checking Ollama at http://localhost:11434 ...
curl -s --connect-timeout 5 http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo Ollama is NOT running or not reachable
    echo Start it with: ollama serve
    exit /b 1
)
echo Ollama is running

REM List installed models
echo.
echo === Installed Models ===
for /f "tokens=*" %%m in ('curl -s http://localhost:11434/api/tags ^| python -c "import sys,json; [print(m['name']) for m in json.load(sys.stdin)['models']]" 2^>nul') do (
    echo   - %%m
)

REM Check required models (using python to parse JSON)
echo.
echo === Required Models ===
set "MISSING=0"
for /f "tokens=*" %%m in ('python -c "import json; [print(m) for m in json.load(open(r'%CONFIG%'))['models']]"') do (
    curl -s http://localhost:11434/api/tags | python -c "import sys,json; exit(0 if any(%%m in m['name'] for m in json.load(sys.stdin)['models']) else 1)" 2>nul
    if errorlevel 1 (
        echo   [MISSING] %%m
        set /a MISSING+=1
    ) else (
        echo   [OK] %%m
    )
)

REM Pull missing models if requested
if "%PULL_MISSING%"=="true" (
    if !MISSING! gtr 0 (
        echo.
        echo === Pulling Missing Models ===
        for /f "tokens=*" %%m in ('python -c "import json; [print(m) for m in json.load(open(r'%CONFIG%'))['models']]"') do (
            curl -s http://localhost:11434/api/tags | python -c "import sys,json; exit(0 if any(%%m in m['name'] for m in json.load(sys.stdin)['models']) else 1)" 2>nul
            if errorlevel 1 (
                echo Pulling %%m ...
                ollama pull %%m
            )
        )
        echo Done
    )
) else if !MISSING! gtr 0 (
    echo.
    echo Run with --pull to download missing models
)

echo.
echo === Summary ===
for /f "tokens=*" %%d in ('python -c "import json; print(json.load(open(r'%CONFIG%'))['defaultModel'])"') do echo Default model: %%d
for /f "tokens=*" %%e in ('python -c "import json; print(json.load(open(r'%CONFIG%'))['embeddingModel'])"') do echo Embedding model: %%e

endlocal
