"""Start the native Render service with explicit preflight diagnostics."""
import faulthandler
import os
from pathlib import Path
import shutil


def main():
    root = Path(__file__).resolve().parent
    os.chdir(root)
    print("MatchVision: starting deployment checks", flush=True)
    frontend = Path(os.environ.get("MATCHVISION_FRONTEND_DIST") or root / "frontend/dist")
    if not (frontend / "index.html").is_file():
        raise RuntimeError("Frontend build missing. Set Render Build Command to: bash render-build.sh")
    os.environ["MATCHVISION_FRONTEND_DIST"] = str(frontend.resolve())
    if not shutil.which("ffmpeg"):
        import imageio_ffmpeg
        executable = Path(imageio_ffmpeg.get_ffmpeg_exe())
        bin_dir = root / ".render-bin"
        bin_dir.mkdir(exist_ok=True)
        target = bin_dir / ("ffmpeg.exe" if os.name == "nt" else "ffmpeg")
        if not target.exists():
            shutil.copy2(executable, target)
        os.environ["PATH"] = str(bin_dir) + os.pathsep + os.environ.get("PATH", "")
    port = int(os.environ.get("PORT", "10000"))
    print(f"MatchVision: frontend ready; importing API for port {port}", flush=True)
    # If an import stalls, show its stack in Render logs instead of remaining silent.
    faulthandler.dump_traceback_later(60, repeat=True)
    try:
        import uvicorn
        from matchvision.api.app import app
    finally:
        faulthandler.cancel_dump_traceback_later()
    print(f"MatchVision: starting HTTP server on 0.0.0.0:{port}", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, workers=1)


if __name__ == "__main__":
    main()
