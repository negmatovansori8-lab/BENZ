from pathlib import Path
import subprocess
import sys

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image

d = Path("client/public/stock/brands")
saved = 0
for p in sorted(d.glob("*.jpg")):
    before = p.stat().st_size
    if before < 120_000:
        continue
    im = Image.open(p).convert("RGB")
    im.thumbnail((900, 600))
    tmp = p.with_suffix(".tmp.jpg")
    im.save(tmp, "JPEG", quality=70, optimize=True)
    after = tmp.stat().st_size
    if after < before:
        tmp.replace(p)
        saved += before - after
        print(f"{p.name} {before // 1024}->{after // 1024}kb")
    else:
        tmp.unlink(missing_ok=True)

files = list(d.glob("*.jpg"))
total = sum(x.stat().st_size for x in files)
print("savedMB", round(saved / 1024 / 1024, 1), "totalMB", round(total / 1024 / 1024, 1), "n", len(files))
