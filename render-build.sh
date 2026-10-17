#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
python -m pip install -r requirements.txt
python -m pip check
npm ci --prefix frontend
npm run build --prefix frontend
python -c "from pathlib import Path; p=Path('model/best.pt'); assert p.is_file() and p.stat().st_size > 1000000, 'Missing model weights: check Git LFS'; assert Path('frontend/dist/index.html').is_file(), 'Frontend build missing'; print('MatchVision build checks passed')"
