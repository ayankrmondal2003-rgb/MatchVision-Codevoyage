import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from matchvision.api.app import create_app
from matchvision.api.config import Settings


class DeploymentTests(unittest.TestCase):
    def test_native_render_automatically_serves_frontend(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "frontend/dist").mkdir(parents=True)
            (root / "frontend/dist/index.html").write_text("Native Render frontend")
            settings = Settings(upload_root=root / "uploads", output_root=root / "outputs")
            with patch.dict(os.environ, {"RENDER": "true", "MATCHVISION_FRONTEND_DIST": ""}), patch(
                "matchvision.api.app.PROJECT_ROOT", root
            ):
                with TestClient(create_app(settings)) as client:
                    self.assertEqual(client.get("/").text, "Native Render frontend")
                    self.assertEqual(client.head("/").status_code, 200)
                    self.assertEqual(client.get("/api/health").status_code, 200)
                (root / "frontend/dist/index.html").unlink()
                with self.assertRaisesRegex(RuntimeError, "Frontend build missing"):
                    create_app(settings)

    def test_production_routes_and_asset_isolation(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            frontend = root / "dist"
            (frontend / "assets").mkdir(parents=True)
            (frontend / "index.html").write_text("<html>MatchVision test</html>")
            (frontend / "assets" / "app.js").write_text("console.log('ready')")
            settings = Settings(upload_root=root / "uploads", output_root=root / "outputs")
            with patch.dict(os.environ, {"MATCHVISION_FRONTEND_DIST": str(frontend)}):
                app = create_app(settings)
            with TestClient(app) as client:
                for path in ("/", "/upload", "/processing/" + "a" * 32, "/analysis/" + "a" * 32):
                    response = client.get(path)
                    self.assertEqual(response.status_code, 200, path)
                    self.assertIn("MatchVision test", response.text)
                self.assertEqual(client.get("/assets/app.js").status_code, 200)
                self.assertEqual(client.get("/api/health").json()["status"], "ok")
                for path in ("/api/missing", "/assets/missing.js", "/model/best.pt", "/requirements.txt"):
                    response = client.get(path)
                    self.assertEqual(response.status_code, 404, path)
                    self.assertNotIn("MatchVision test", response.text)
                self.assertEqual(client.post("/upload").status_code, 405)

    def test_missing_frontend_fails_startup(self):
        with tempfile.TemporaryDirectory() as temporary:
            with patch.dict(os.environ, {"MATCHVISION_FRONTEND_DIST": temporary}):
                with self.assertRaisesRegex(RuntimeError, "Frontend build missing"):
                    create_app()
