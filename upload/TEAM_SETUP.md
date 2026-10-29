# Team Setup & Collaboration Guide (Incident-Zero I-ITSM v2.2)

Welcome to the **Incident-Zero** project! Follow these 4 simple steps to collaborate:

1. **Clone the Private GitHub Repository:**
   ```bash
   git clone https://github.com/srijans123/IncidentZero.git
   cd IncidentZero
   ```

2. **Configure Your Environment Secrets:**
   - Copy `.env.example` to `.env` in the workspace root.
   - Populate `.env` with the project team credentials (`NEON_DATABASE_URL`, `BETTER_AUTH_SECRET`, `CODERABBIT_API_KEY`). Note that `.env` is ignored by `.gitignore` and must never be committed.

3. **Develop & Test Your Assigned Modules:**
   - Run the local backend (`mvn clean test` or `bash scripts/verify-m1.sh`..`verify-m6.sh`) and frontend (`npm install && npm run dev` inside `frontend/`).
   - Ensure all verification scripts pass before pushing.

4. **One-Click Sync & Version Bump:**
   - On Windows: Double-click `upload\update_github.bat` in File Explorer, optionally type a commit message, and press Enter.
   - On macOS/Linux: Run `bash upload/update_github.sh "Your change summary"`.
   - The script automatically increments the project minor version (`v1.Y`), logs the changelog entry in `upload/CHANGELOG.md`, tags the release, pulls teammate changes with rebase, and pushes cleanly to GitHub.
