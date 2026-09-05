#!/usr/bin/env python3
"""Fill missing Latin and Thai outlines in the Angsana subset fonts.

The PDF extracts were swapped: Regular.ttf holds bold outlines and
Bold.ttf holds regular outlines. Angsana UPC Latin is Times New Roman
at I-cap scale (1790/1356). The subset left H and other unused letters
as empty slots with Times metrics, so missing Latin is copied from
Times at that scale — not invented from I stems.
"""

from __future__ import annotations

from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
KARMART = ROOT / "src/assets/karmart"
ORIG_REGULAR = KARMART / "AngsanaUPC-Bold.ttf"  # regular outlines
ORIG_BOLD = KARMART / "AngsanaUPC-Regular.ttf"  # bold outlines
AYUTHAYA = Path("/System/Library/Fonts/Supplemental/Ayuthaya.ttf")
TIMES_REGULAR = Path("/System/Library/Fonts/Supplemental/Times New Roman.ttf")
TIMES_BOLD = Path("/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf")

ASCII = list(range(0x20, 0x7F))
THAI = list(range(0x0E01, 0x0E3B)) + list(range(0x0E3F, 0x0E5C))
NEEDED = ASCII + THAI


def ascii_name(char: str) -> str:
    return f"glyph{ord(char) - 29:05d}"


def cmap_map(font: TTFont) -> dict[int, str]:
    mapping: dict[int, str] = {}
    for table in font["cmap"].tables:
        mapping.update(table.cmap)
    return mapping


def has_outline(font: TTFont, name: str) -> bool:
    if name not in font.getGlyphOrder():
        return False
    glyph = font["glyf"][name]
    if glyph.isComposite():
        return True
    return (glyph.numberOfContours or 0) > 0


def glyph_bounds(font: TTFont, name: str):
    pen = BoundsPen(font.getGlyphSet())
    font.getGlyphSet()[name].draw(pen)
    return pen.bounds


def set_cmap(font: TTFont, uni: int, name: str) -> None:
    for table in font["cmap"].tables:
        table.cmap[uni] = name


def append_glyph(font: TTFont, name: str, glyph, advance: int, lsb: int) -> None:
    font["glyf"][name] = glyph
    font["hmtx"].metrics[name] = (advance, lsb)
    order = font.getGlyphOrder()
    if name not in order:
        font.setGlyphOrder([*order, name])
    font["maxp"].numGlyphs = len(font.getGlyphOrder())


def copy_outlined(src: TTFont, dest: TTFont) -> int:
    copied = 0
    for name in src.getGlyphOrder():
        if name not in dest.getGlyphOrder() or not has_outline(src, name):
            continue
        recorded = DecomposingRecordingPen(src.getGlyphSet())
        src.getGlyphSet()[name].draw(recorded)
        pen = TTGlyphPen(None)
        recorded.replay(pen)
        dest["glyf"][name] = pen.glyph()
        dest["hmtx"].metrics[name] = src["hmtx"][name]
        copied += 1
    return copied


def put(font: TTFont, char: str, glyph, advance: int, lsb: int) -> None:
    name = ascii_name(char)
    font["glyf"][name] = glyph
    font["hmtx"].metrics[name] = (int(advance), int(lsb))
    set_cmap(font, ord(char), name)


def long_horizontals(ops: list, min_span: float) -> list[float]:
    ys: list[float] = []
    prev: tuple[float, float] | None = None
    for op, pts in ops:
        if op in ("moveTo", "lineTo") and pts:
            x, y = pts[0]
            if prev is not None and abs(y - prev[1]) < 1 and abs(x - prev[0]) >= min_span:
                ys.append(y)
            prev = (x, y)
        elif pts:
            prev = pts[-1]
    return ys


def thicken_h_bar(font: TTFont) -> None:
    """Times H's bar is ~98 units — a hairline at receipt size (~5.7pt).

    Expand it to the I stem thickness so the bar still paints after raster.
    Stems and serifs stay Times, which is what Angsana Latin already is.
    """
    name = ascii_name("H")
    i_bounds = glyph_bounds(font, ascii_name("I"))
    target = max(180, int((i_bounds[2] - i_bounds[0]) * 0.33))
    recorded = DecomposingRecordingPen(font.getGlyphSet())
    font.getGlyphSet()[name].draw(recorded)
    bar_ys = sorted(set(round(y) for y in long_horizontals(recorded.value, 400)))
    mid = (i_bounds[1] + i_bounds[3]) / 2
    bar_ys = [y for y in bar_ys if abs(y - mid) < 500]
    if len(bar_ys) < 2:
        return
    lo, hi = min(bar_ys), max(bar_ys)
    center = (lo + hi) / 2
    new_lo, new_hi = center - target / 2, center + target / 2
    pen = TTGlyphPen(None)

    def map_y(y: float) -> float:
        if abs(y - lo) <= 1:
            return new_lo
        if abs(y - hi) <= 1:
            return new_hi
        return y

    for op, pts in recorded.value:
        mapped = tuple((p[0], map_y(p[1])) for p in pts)
        if op == "moveTo":
            pen.moveTo(mapped[0])
        elif op == "lineTo":
            pen.lineTo(mapped[0])
        elif op == "qCurveTo":
            pen.qCurveTo(*mapped)
        elif op == "closePath":
            pen.closePath()
    advance, lsb = font["hmtx"][name]
    put(font, "H", pen.glyph(), advance, lsb)


def times_scale(dest: TTFont, times: TTFont) -> float:
    dest_i = glyph_bounds(dest, ascii_name("I"))
    times_i = glyph_bounds(times, times.getBestCmap()[ord("I")])
    return (dest_i[3] - dest_i[1]) / (times_i[3] - times_i[1])


def build_latin(font: TTFont, native: TTFont, times: TTFont) -> list[str]:
    added: list[str] = []
    if not has_outline(font, ascii_name("I")):
        return added
    scale = times_scale(font, times)
    times_cmap = times.getBestCmap()
    times_glyphs = times.getGlyphSet()
    for uni in ASCII:
        char = chr(uni)
        if char == " ":
            continue
        name = ascii_name(char)
        if has_outline(native, name) or uni not in times_cmap:
            continue
        recorded = DecomposingRecordingPen(times_glyphs)
        times_glyphs[times_cmap[uni]].draw(recorded)
        pen = TTGlyphPen(None)
        recorded.replay(TransformPen(pen, Transform(scale, 0, 0, scale, 0, 0)))
        if name in font.getGlyphOrder():
            advance, lsb = font["hmtx"][name]
        else:
            donor_aw, donor_lsb = times["hmtx"][times_cmap[uni]]
            advance = int(round(donor_aw * scale))
            lsb = int(round(donor_lsb * scale))
        put(font, char, pen.glyph(), advance, lsb)
        added.append(char)
    if "H" in added:
        thicken_h_bar(font)
    return added


def fill_thai(dest: TTFont) -> list[str]:
    donor = TTFont(AYUTHAYA)
    scale = glyph_bounds(dest, cmap_map(dest)[ord("ก")])[3] / glyph_bounds(
        donor, donor.getBestCmap()[ord("ก")]
    )[3]
    added: list[str] = []
    for uni in THAI:
        current = cmap_map(dest).get(uni)
        if current and has_outline(dest, current):
            continue
        donor_cmap = donor.getBestCmap()
        if uni not in donor_cmap:
            continue
        recorded = DecomposingRecordingPen(donor.getGlyphSet())
        donor.getGlyphSet()[donor_cmap[uni]].draw(recorded)
        pen = TTGlyphPen(None)
        recorded.replay(TransformPen(pen, Transform(scale, 0, 0, scale, 0, 0)))
        glyph = pen.glyph()
        advance, lsb = donor["hmtx"][donor_cmap[uni]]
        name = current or f"uni{uni:04X}"
        if current:
            dest["glyf"][name] = glyph
            dest["hmtx"].metrics[name] = (int(round(advance * scale)), int(round(lsb * scale)))
        else:
            append_glyph(
                dest,
                name,
                glyph,
                int(round(advance * scale)),
                int(round(lsb * scale)),
            )
        set_cmap(dest, uni, name)
        added.append(chr(uni))
    return added


def missing(path: Path) -> str:
    font = TTFont(path)
    mapping = cmap_map(font)
    holes: list[str] = []
    for uni in NEEDED:
        char = chr(uni)
        if char == " ":
            continue
        name = mapping.get(uni)
        if not name or not has_outline(font, name):
            holes.append(char)
    return "".join(holes)


def patch_face(dest_path: Path, native_path: Path, times_path: Path) -> None:
    dest = TTFont(dest_path)
    native = TTFont(native_path)
    restored = copy_outlined(native, dest)
    latin = build_latin(dest, native, TTFont(times_path))
    thai = fill_thai(dest)
    dest.save(dest_path)
    print(
        dest_path.name,
        "restored",
        restored,
        "latin",
        "".join(latin),
        "thai",
        "".join(thai) or "(kept)",
    )


def main() -> None:
    regular = KARMART / "AngsanaUPC-Regular-cmap.ttf"
    bold = KARMART / "AngsanaUPC-Bold-cmap.ttf"
    patch_face(regular, ORIG_REGULAR, TIMES_REGULAR)
    patch_face(bold, ORIG_BOLD, TIMES_BOLD)
    for path in (regular, bold):
        holes = missing(path)
        print(path.name, "still missing", holes or "(none)")
        if holes:
            raise SystemExit(1)


if __name__ == "__main__":
    main()
