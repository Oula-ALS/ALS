#!/usr/bin/env bash
# Cleans a voice recording for the app: removes rumble and hiss, trims silence at
# the start and end, and makes every clip the same loudness. Output: mono MP3.
#
#   scripts/clean-audio.sh input.ogg assets/audio/words/samak.mp3
#
# Needs ffmpeg. The original file is never changed.
set -euo pipefail
in="$1"; out="$2"
mkdir -p "$(dirname "$out")"
ffmpeg -hide_banner -loglevel error -y -i "$in" -ac 1 -ar 44100 -af "\
highpass=f=80,lowpass=f=9000,\
afftdn=nf=-45:tn=1,\
silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.08,\
areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.12,areverse,\
loudnorm=I=-18:TP=-2:LRA=7,\
afade=t=in:d=0.02" \
  -codec:a libmp3lame -b:a 96k "$out"
