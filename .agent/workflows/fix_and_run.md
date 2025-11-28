---
description: Fix project structure and run the app
---

The project structure seems to have a nested `app` folder (`app/app`). We need to fix this before running.

1. Fix the directory structure:
   ```powershell
   Move-Item -Path "app\app\*" -Destination "app" -Force
   Remove-Item "app\app" -Force
   ```

2. Install dependencies (just in case):
   ```powershell
   npm install
   ```

3. Run the development server:
   ```powershell
   npm run dev
   ```

4. Open your browser to:
   http://localhost:3000
