#!/usr/bin/env bash
# Build one 30s trend promo end to end: picture (60 fps, 4 parallel chunks) → sound → mux.
# Usage: ./promo-build.sh ai|tot|near [fps]
set -euo pipefail
cd "$(dirname "$0")"
id="$1"; fps="${2:-60}"
export FFMPEG_PATH="${FFMPEG_PATH:-$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')}"
node render-par.mjs --page promo.html --data "data/promo-$id.json" --fps "$fps" --duration 30 --jobs 4 --out "out/promo-$id-silent.mp4"
node cues.mjs --page promo.html --data "data/promo-$id.json" --out "out/promo-$id-cues.json"
python3 sfx.py "out/promo-$id-cues.json" "out/promo-$id-mix.wav"
"$FFMPEG_PATH" -y -loglevel error -i "out/promo-$id-silent.mp4" -i "out/promo-$id-mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "out/promo-$id-${fps}fps.mp4"
echo "DONE $id"
