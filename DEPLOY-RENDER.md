# Deploy MatchVision on Render

The root `render.yaml` deploys one Docker web service. FastAPI serves the built React app and `/api` on the same HTTPS origin. No frontend API URL or CORS change is needed. Local Windows startup still uses Vite and port 8000 as before.

## Deploy

### Existing Python service

You can keep the native Python service. Push `render-build.sh`, `render_start.py`, and the updated API code, then set:

- Root Directory: blank (repository root).
- Build Command: `bash render-build.sh`
- Start Command: `python -u render_start.py`
- Health Check Path: `/api/health`
- Remove a stale `MATCHVISION_FRONTEND_DIST` override (particularly `/app/frontend/dist`, which belongs to Docker). The launcher finds the build automatically.

The build requires Node.js 22.12+ alongside Python. The launcher provides FFmpeg from the installed imageio package, checks the frontend, and prints startup stages. If API import takes over 60 seconds, it prints a diagnostic stack trace. These changes fix native frontend configuration and improve diagnostics; they do not establish the cause of a Render platform timeout before the start command runs. Use a paid instance sized for analysis as discussed below. Persistent storage still needs configuring separately for a manually created service.

### Docker / Blueprint

1. Commit and push these changes to your GitHub repository, including `Dockerfile`, `.dockerignore`, and `render.yaml`.
2. Ensure the real `model/best.pt` weights are uploaded through Git LFS (`git lfs push --all origin`). The file is about 107 MB. The Docker build checks that it is not just a small LFS pointer; if this check fails, check the repository's LFS availability/quota and fetch the weights before rebuilding. Do not replace it with a generic YOLO model.
3. In Render choose **New > Blueprint**, connect the repository, and select the branch containing these changes. Keep the repository root as the build context.
4. Review the paid compute and disk cost before creating the service. The Blueprint selects 2 CPUs, 8 GB RAM and a 20 GB persistent disk. This is a starting configuration, not a guarantee for all video sizes. Free 512 MB instances are unsuitable for this model.
5. Deploy, then open the service's `https://...onrender.com` URL. Verify `/api/health` returns `status: ok`, then upload a short football clip and check the results and processed video.

For manual setup, choose **Web Service > Docker**, Dockerfile `./Dockerfile`, health check `/api/health`, one instance, and a disk mounted at `/app/storage`. Keep the default Docker command; it binds to `0.0.0.0` and Render's `PORT` with one worker. Copy the environment variables from `render.yaml`.

## Runtime behavior and limits

- CPU inference is slower than a local GPU. Start with a 5–10 second clip, then measure memory and processing time before accepting longer videos.
- The deployment limits uploads to 200 MiB and active jobs to two (one processing, one waiting). Adjust `MATCHVISION_MAX_UPLOAD_BYTES` and `MATCHVISION_MAX_ACTIVE_JOBS` only after checking resources. File size alone does not bound decoding/inference memory.
- Uploads and generated files persist on the disk, but **job registrations are still in memory**. Restarting or redeploying interrupts work and makes previous analysis URLs unavailable. Upload again after a restart; retained files can be retrieved by the operator from the disk. Do not scale to multiple instances or Uvicorn workers with this queue.
- Disk cleanup is manual. Monitor storage and remove old uploads/results when no longer needed. A full disk will prevent new analysis.
- This is a single-instance demo deployment, without authentication or per-user quotas. Anyone with the URL can submit jobs. Add access controls and a persistent job queue before opening it to unrestricted public use.
- FFmpeg and CPU PyTorch are included in the image. No CUDA installation is needed. Calibration limitations still apply to new camera views.

## Optional local container check

With Docker Desktop running in Linux container mode:

```powershell
docker build -t matchvision .
docker run --rm -p 10000:10000 -e PORT=10000 -v matchvision-data:/app/storage matchvision
```

Open `http://localhost:10000`. Refresh an `/analysis/<id>` page to check React routing. Unknown `/api/...` and missing asset URLs should return 404, not the frontend HTML.

Render references: [Docker](https://render.com/docs/docker), [Blueprint configuration](https://render.com/docs/blueprint-spec), [persistent disks](https://render.com/docs/disks).

## Validation performed

The frontend production build and 61 Python tests pass locally, including static asset isolation, API routing, and React deep links. The Linux Docker image and an actual Render deployment have not been run: Docker Desktop's engine was unavailable during setup. Treat the first Render build and short-video smoke test as required deployment validation.
