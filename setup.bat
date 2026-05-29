@echo off
echo ============================================
echo  Studio-Grade Landing Page Stack — Setup
echo ============================================
echo.

:: 1. Install npm packages (frontend)
echo [1/4] Installing frontend packages (GSAP + Lenis)...
cd /d "%~dp0frontend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
)
echo Done.
echo.

:: 2. Install Gemini CLI (required for Nano Banana)
echo [2/4] Checking Gemini CLI...
where gemini >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Gemini CLI not found. Installing via npm...
    call npm install -g @google/gemini-cli
) else (
    echo Gemini CLI already installed.
)
echo.

:: 3. Install Nano Banana extension
echo [3/4] Installing Nano Banana image generation extension...
call gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
echo.

:: 4. Set API key reminder
echo [4/4] API Key Setup
echo.
echo  Set your Google AI Studio key as an environment variable:
echo  (Get one free at https://aistudio.google.com/apikey)
echo.
echo  Option A: Set permanently via System Environment Variables
echo    Variable: NANOBANANA_API_KEY
echo    Value:    your-api-key-here
echo.
echo  Option B: Set for current session only:
echo    set NANOBANANA_API_KEY=your-api-key-here
echo.
echo ============================================
echo  MANUAL STEP: 21st Dev MCP
echo ============================================
echo.
echo  In Claude Code, run:
echo    claude mcp add --name "21st-dev" -- npx -y @21st-dev/magic-mcp
echo.
echo  Then get your free API key at https://21st.dev/mcp
echo  and add it when prompted.
echo.
echo ============================================
echo  Setup complete! Next steps:
echo  1. Add your NANOBANANA_API_KEY (see above)
echo  2. Add 21st Dev MCP to Claude Code (see above)
echo  3. Run: cd frontend ^&^& npm run dev
echo ============================================
pause
