#!/bin/sh
# Makes small copies of the post and project photos for the cards on the home page,
# so the page doesn't have to load and shrink full-size photos while you scroll.
#   public/updates/<post>/1.jpg   → public/updates/<post>/thumbs/1.jpg   (176px, for the 88px squares)
#   public/projects/<slug>/1.jpg  → public/projects/<slug>/thumbs/1.jpg  (960px wide, for the card cover)
# Run it after adding photos:  sh scripts/make-thumbs.sh
# It uses "sips", which comes with macOS. Photos that already have a thumbnail are skipped.

cd "$(dirname "$0")/.." || exit 1

make_thumb() { # $1 = photo, $2 = "square" or "cover"
  src="$1"
  out="$(dirname "$src")/thumbs/$(basename "$src")"
  [ -f "$out" ] && [ "$out" -nt "$src" ] && return
  mkdir -p "$(dirname "$out")"
  w=$(sips -g pixelWidth "$src" | awk '/pixelWidth/ {print $2}')
  h=$(sips -g pixelHeight "$src" | awk '/pixelHeight/ {print $2}')
  if [ "$2" = square ]; then
    # Shortest side to 176px, so it still fills the square after cropping.
    if [ "$w" -lt "$h" ]; then set -- --resampleWidth 176; else set -- --resampleHeight 176; fi
  else
    set -- --resampleWidth 960
    [ "$w" -le 960 ] && set -- # already small enough: just copy
  fi
  sips "$@" -s formatOptions 80 "$src" --out "$out" >/dev/null
  echo "made $out"
}

for f in public/updates/*/*.jpg public/updates/*/*.jpeg public/updates/*/*.png; do
  [ -f "$f" ] && make_thumb "$f" square
done
for f in public/projects/*/*.jpg public/projects/*/*.jpeg public/projects/*/*.png; do
  [ -f "$f" ] && make_thumb "$f" cover
done
