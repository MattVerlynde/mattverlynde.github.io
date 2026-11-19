import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const mulberry = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/** Builds one landmark per section key. Objects are tagged with userData.region so clicks open the right section. */
export function buildLandmarks({ regions, toVec, toUV, regionAt }) {
  const root = new THREE.Group(), rand = mulberry(7);
  const mat = (color, emissive = 0) => new THREE.MeshStandardMaterial({ color, emissive, roughness: .85 });
  const box = new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0);                       // unit box standing on y = 0
  const pyramid = new THREE.ConeGeometry(.71, 1, 4).rotateY(Math.PI / 4).translate(0, .5, 0);

  // A grid of spots around a continent's centre; returns null for spots that fall in the sea.
  const site = r => {
    const c = toVec(r.lat, r.lon), t1 = new THREE.Vector3().crossVectors(c, UP).normalize();
    const t2 = new THREE.Vector3().crossVectors(c, t1);
    const at = (dx, dz) => {
      const p = c.clone().addScaledVector(t1, dx).addScaledVector(t2, dz).normalize();
      return regionAt(...toUV(p)) === r.id ? p : null;
    };
    at.t1 = t1;
    return at;
  };
  const orient = (p, t1) => {                                                           // local up = planet normal
    const n = p.clone().normalize(), x = t1.clone().addScaledVector(n, -t1.dot(n)).normalize();
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, n, new THREE.Vector3().crossVectors(x, n)));
  };
  const put = (g, geo, m, p, s, t1, yaw = 0) => {
    const o = new THREE.Mesh(geo, m);
    o.position.copy(p); o.quaternion.copy(orient(p, t1)); o.rotateY(yaw); o.scale.set(...s);
    g.add(o);
  };

  const city = r => {
    const g = new THREE.Group(), at = site(r), tones = [0x9fb4c8, 0x7f95ad, 0xc4d0dc].map(c => mat(c, 0x0c1424));
    for (let i = 0; i < 50; i++) {
      const a = rand() * 6.283, d = Math.sqrt(rand()) * .17, p = at(Math.cos(a) * d, Math.sin(a) * d);
      if (p) put(g, box, tones[i % 3], p, [.016 + rand() * .02, (.04 + rand() * .07) * (1.5 - d * 4), .016 + rand() * .02], at.t1, rand() * 3);
    }
    const c = at(0, 0);
    if (c) put(g, box, mat(0xf2c14e, 0x6b4a00), c, [.03, .17, .03], at.t1);             // the tall tower
    return g;
  };

  const campus = r => {
    const g = new THREE.Group(), at = site(r), wall = mat(0xe8d9bd), roof = mat(0x9b4f3e);
    const hall = (dx, dz, w, h, d) => {
      const p = at(dx, dz);
      if (!p) return;
      put(g, box, wall, p, [w, h, d], at.t1);
      put(g, pyramid, roof, p.clone().multiplyScalar(1 + h), [w * 1.1, h * .6, d * 1.1], at.t1);
    };
    const lawn = at(0, 0);
    if (lawn) put(g, box, mat(0x6aa85f), lawn, [.13, .004, .13], at.t1);
    hall(0, -.09, .1, .035, .04);                                                       // main hall
    hall(.07, -.09, .022, .1, .022);                                                    // clock tower
    hall(-.08, .03, .04, .03, .06); hall(.08, .03, .04, .03, .06); hall(0, .09, .06, .025, .03);
    return g;
  };

  const forest = r => {
    const g = new THREE.Group(), at = site(r), spots = [];
    for (let i = 0; i < 900 && spots.length < 170; i++) {
      const a = rand() * 6.283, d = Math.sqrt(rand()) * .3, p = at(Math.cos(a) * d, Math.sin(a) * d);
      if (p) spots.push(p);
    }
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .08, .3, 6).translate(0, .15, 0), mat(0x6b4a2e), spots.length);
    const crown = new THREE.InstancedMesh(new THREE.ConeGeometry(.4, .9, 7).translate(0, .75, 0), mat(0xffffff), spots.length);
    const m = new THREE.Matrix4(), col = new THREE.Color();
    spots.forEach((p, i) => {
      const s = .035 + rand() * .035;
      m.compose(p, orient(p, at.t1), new THREE.Vector3(s, s * (.8 + rand() * .6), s));
      trunk.setMatrixAt(i, m); crown.setMatrixAt(i, m);
      crown.setColorAt(i, col.setHSL(.27 + rand() * .08, .5, .22 + rand() * .12));
    });
    g.add(trunk, crown);
    return g;
  };

  const builders = { 'current-work': city, history: campus, interests: forest };
  for (const r of regions) {
    const g = builders[r.key]?.(r);
    if (g) { g.traverse(o => o.userData.region = r.id); root.add(g); }
  }

  // Satellite on a tilted orbit, standing for the contact section.
  const satellite = new THREE.Group(), tilt = new THREE.Euler(.5, 0, .3), R = 1.4;
  const gold = mat(0xd6b25e, 0x3a2a05), panel = mat(0x2d5fa8, 0x0a1a33);
  const part = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); satellite.add(o); return o; };
  part(new THREE.BoxGeometry(.05, .05, .07), gold);
  part(new THREE.BoxGeometry(.11, .004, .05), panel, -.085);
  part(new THREE.BoxGeometry(.11, .004, .05), panel, .085);
  part(new THREE.ConeGeometry(.035, .025, 16).rotateX(-Math.PI / 2), gold, 0, 0, .05);  // dish faces the planet
  const contact = regions.find(r => r.key === 'contact');
  if (contact) satellite.traverse(o => o.userData.region = contact.id);
  root.add(satellite);

  const ring = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(Array.from({ length: 128 }, (_, i) => new THREE.Vector3(Math.cos(i / 128 * 6.2832), 0, Math.sin(i / 128 * 6.2832)).multiplyScalar(R))),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .12 }));
  ring.rotation.copy(tilt); ring.raycast = () => {};
  root.add(ring);

  const update = t => {
    const a = t * .25;
    satellite.position.set(Math.cos(a) * R, 0, Math.sin(a) * R).applyEuler(tilt);
    satellite.lookAt(0, 0, 0);
  };
  update(0);
  return { root, satellite, update };
}
