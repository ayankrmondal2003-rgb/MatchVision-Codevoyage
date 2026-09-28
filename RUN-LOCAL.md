# Run MatchVision on this PC

Double-click `start-matchvision.cmd` in this folder. It starts the API and frontend in the background and prints the local links.

- App: http://127.0.0.1:5173
- API documentation: http://127.0.0.1:8000/docs
- Logs: backend.log, backend-error.log, frontend.log, frontend-error.log

Choose Upload and select a football video. Start with a short clip: this installation uses CPU inference. Output files are saved under outputs/<analysis-id>/.

If reinstalling dependencies, run from this folder:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm.cmd --prefix frontend install
```

A frontend production build, all 59 existing unit tests, and a one-second real-footage upload/analysis/results check passed during local setup. Full-length match performance and browser interactions have not been verified. Shot detection requires camera-specific calibration; speed and distance estimates also need calibration for new camera views.

The backend queue is in memory. Restarting the backend loses dashboard job registrations, but generated files remain in outputs.
