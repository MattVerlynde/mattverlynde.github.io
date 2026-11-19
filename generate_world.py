"""Generate assets/texture.png, assets/mask.png and assets/regions.json.

Run from the site root:  python tools/generate_world.py [seed]
Needs: numpy, scipy, pillow.
One continent is made per section in content.json. Biggest continent = first section.
mask.png stores the continent id (1..N) in its pixels; 0 is ocean or unlinked islands.
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

W, H = 2048, 1024
SEA = .5  # land where height > SEA
sections = json.load(open("content.json"))["sections"]
N = len(sections)

def grid(w, h):
    lon = (np.arange(w) + .5) / w * 2 * np.pi - np.pi
    lat = np.pi / 2 - (np.arange(h) + .5) / h * np.pi
    LON, LAT = np.meshgrid(lon, lat)
    P = np.stack([np.cos(LAT) * np.cos(LON), np.sin(LAT), np.cos(LAT) * np.sin(LON)], -1).astype(np.float32)
    return lon, lat, LAT, P, np.cos(LAT)


def height(seed, P):
    """N seeded landmasses (gaussian bumps) with plane-wave noise coastlines. Seamless on the sphere."""
    r = np.random.default_rng(seed)
    noise = np.zeros(P.shape[:2], np.float32)
    for o in range(5):
        f = 3.2 * 1.8 ** o
        for _ in range(8):
            k = r.normal(size=3)
            k *= f / np.linalg.norm(k)
            noise += f ** -0.9 * np.sin(P @ k + r.uniform(0, 2 * np.pi)).astype(np.float32)
    h = noise / noise.std() * .35
    centers, tries = [], 0
    while len(centers) < N:
        tries += 1
        if tries > 300:  # greedy packing got stuck: start over
            centers, tries = [], 0
        c = r.normal(size=3)
        c /= np.linalg.norm(c)
        if all(c @ q < np.cos(1.0) for q in centers):
            centers.append(c)
    for c in centers:
        ang = np.arccos(np.clip(P @ c, -1, 1))
        h += r.uniform(.8, 1.2) * np.exp(-(ang / r.uniform(.45, .8)) ** 2)
    return h


def components(land):
    """Connected components, joined across the longitude seam."""
    lab, n = ndi.label(land)
    parent = list(range(n + 1))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for a, b in zip(lab[:, 0], lab[:, -1]):
        if a and b:
            parent[find(a)] = find(b)
    return np.array([find(i) for i in range(n + 1)])[lab]


def ranked(lab, wts):
    ids = np.unique(lab[lab > 0])
    areas = np.array(ndi.sum(wts, lab, ids))
    o = np.argsort(-areas)
    return ids[o], areas[o]


start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
lo = grid(512, 256)  # cheap grid for the seed search
for seed in range(start, start + 600):
    h = height(seed, lo[3])
    lab = components(h > SEA)
    ids, areas = ranked(lab, lo[4])
    if len(ids) >= N and areas[N - 1] > .008 * lo[4].sum() and areas[0] < .5 * areas.sum():
        print("seed", seed)
        break
else:
    sys.exit("No good seed found, try another start seed.")

lon, lat, LAT, P, wts = grid(W, H)
h = height(seed, P)
sea = SEA
lab = components(h > sea)
order, _ = ranked(lab, wts)

mask = np.zeros((H, W), np.uint8)
regions = []
for rank, i in enumerate(order[:N]):
    m = lab == i
    mask[m] = rank + 1
    c = (P[m] * wts[m][:, None]).sum(0)
    c /= np.linalg.norm(c)
    j = np.argmax(P[m] @ c)  # snap to a real land pixel
    ys, xs = np.nonzero(m)
    regions.append({"id": rank + 1, "key": sections[rank]["key"],
                    "lat": float(np.degrees(lat[ys[j]])), "lon": float(np.degrees(lon[xs[j]]))})

# colours
e = np.clip((h - sea) / (h.max() - sea), 0, 1)[..., None]
d = np.clip((sea - h) / (sea - h.min()), 0, 1)[..., None]
tints = np.array([(110, 165, 90), (200, 160, 95), (95, 160, 150), (175, 120, 140), (160, 175, 85), (205, 120, 90)], float)
tint = np.where((mask > 0)[..., None], tints[(mask.astype(int) - 1) % len(tints)], (105, 140, 90))
land = tint + (np.array((125, 105, 85)) - tint) * np.clip(e * 1.5, 0, 1)
land += (255 - land) * np.clip((e - .7) / .3, 0, 1)
ocean = np.array((75, 150, 180)) + (np.array((8, 22, 58)) - np.array((75, 150, 180))) * d ** .6
ocean += (np.array((140, 210, 200)) - ocean) * np.clip(1 - d * 9, 0, 1) * .5
img = np.where((h > sea)[..., None], land, ocean)
ice = np.clip((np.abs(LAT) - 1.25) / .25, 0, 1)[..., None]
img += (255 - img) * ice

os.makedirs("assets", exist_ok=True)
Image.fromarray(img.clip(0, 255).astype(np.uint8)).save("assets/texture.png", optimize=True)
Image.fromarray(mask, "L").save("assets/mask.png", optimize=True)
json.dump(regions, open("assets/regions.json", "w"), indent=1)
print("done:", [r["key"] for r in regions])
