const presets = {
  region: {
    EU868: {
      frequencyMHz: 868,
      sliders: {
        gatewayTx: { min: 0, max: 27, value: 14, unit: 'dBm' },
        deviceTx: { min: 2, max: 14, value: 14, unit: 'dBm' },
        relayTx: { min: 2, max: 14, value: 14, unit: 'dBm' },
        gatewayGain: { min: 0, max: 8, value: 6, unit: 'dBi' },
        relayGain: { min: 0, max: 8, value: 2, unit: 'dBi' },
        gatewaySensitivity: { min: -142, max: -127.5, value: -142, unit: 'dBm' },
        relaySensitivity: { min: -141, max: -123, value: -133, unit: 'dBm' }
      }
    },
    US915: {
      frequencyMHz: 915,
      sliders: {
        gatewayTx: { min: 0, max: 27, value: 28, unit: 'dBm' },
        deviceTx: { min: 0, max: 30, value: 30, unit: 'dBm' },
        relayTx: { min: 0, max: 22, value: 22, unit: 'dBm' },
        gatewayGain: { min: 0, max: 8, value: 6, unit: 'dBi' },
        relayGain: { min: 0, max: 8, value: 2, unit: 'dBi' },
        gatewaySensitivity: { min: -142, max: -127.5, value: -142, unit: 'dBm' },
        relaySensitivity: { min: -141, max: -123, value: -133, unit: 'dBm' }
      }
    }
  },
  gateway: {
    Macro: { txLoss: 1.0, rxLoss: 1.0, miscBonus: 0.0, note: 'Balanced gateway profile.' },
    Mega: { txLoss: 1.0, rxLoss: 1.0, miscBonus: 1.5, note: 'Stronger edge profile with extra gateway-side margin.' }
  },
  terrain: {
    open: {
      label: 'Open rural', bg: '#18324d',
      direct: { fade: 12, clutter: 4, misc: 3, refDistanceKm: 8.5, refPathLoss: 134, exponent: 3.05, horizonFactor: 0.92 },
      relayA: { fade: 10, clutter: 4, misc: 3, refDistanceKm: 3.0, refPathLoss: 126, exponent: 3.0, horizonFactor: 0.94 },
      relayB: { fade: 10, clutter: 3, misc: 3, refDistanceKm: 10.0, refPathLoss: 140, exponent: 3.0, horizonFactor: 0.95 }
    },
    suburban: {
      label: 'Suburban', bg: '#2b3f52',
      direct: { fade: 15, clutter: 9, misc: 4, refDistanceKm: 3.5, refPathLoss: 128, exponent: 3.45, horizonFactor: 0.84 },
      relayA: { fade: 13, clutter: 8, misc: 4, refDistanceKm: 1.6, refPathLoss: 121, exponent: 3.4, horizonFactor: 0.86 },
      relayB: { fade: 14, clutter: 7, misc: 4, refDistanceKm: 4.5, refPathLoss: 132, exponent: 3.35, horizonFactor: 0.87 }
    },
    urban: {
      label: 'Urban / industrial', bg: '#3d3d47',
      direct: { fade: 18, clutter: 14, misc: 5, refDistanceKm: 1.5, refPathLoss: 123, exponent: 3.9, horizonFactor: 0.76 },
      relayA: { fade: 17, clutter: 12, misc: 5, refDistanceKm: 0.9, refPathLoss: 118, exponent: 3.8, horizonFactor: 0.78 },
      relayB: { fade: 17, clutter: 11, misc: 5, refDistanceKm: 2.1, refPathLoss: 127, exponent: 3.7, horizonFactor: 0.79 }
    },
    dense: {
      label: 'Dense obstruction', bg: '#443438',
      direct: { fade: 22, clutter: 18, misc: 6, refDistanceKm: 0.55, refPathLoss: 118, exponent: 4.35, horizonFactor: 0.68 },
      relayA: { fade: 20, clutter: 16, misc: 6, refDistanceKm: 0.4, refPathLoss: 114, exponent: 4.15, horizonFactor: 0.71 },
      relayB: { fade: 21, clutter: 15, misc: 6, refDistanceKm: 0.85, refPathLoss: 121, exponent: 4.05, horizonFactor: 0.72 }
    }
  }
};

const state = { region: 'EU868', gateway: 'Macro', terrain: 'open', useRelay: false };

const ids = ['gatewayTx','deviceTx','relayTx','gatewaySensitivity','relaySensitivity','gatewayGain','relayGain','gatewayHeight','relayHeight','deviceHeight','relayPlacement'];
const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const outputs = {
  gatewayHeightValue: document.getElementById('gatewayHeightValue'), relayHeightValue: document.getElementById('relayHeightValue'),
  deviceHeightValue: document.getElementById('deviceHeightValue'), relayPlacementValue: document.getElementById('relayPlacementValue'),
  gatewayTxValue: document.getElementById('gatewayTxValue'), deviceTxValue: document.getElementById('deviceTxValue'), relayTxValue: document.getElementById('relayTxValue'),
  gatewaySensitivityValue: document.getElementById('gatewaySensitivityValue'), relaySensitivityValue: document.getElementById('relaySensitivityValue'),
  gatewayGainValue: document.getElementById('gatewayGainValue'), relayGainValue: document.getElementById('relayGainValue'),
  limitingLegBadge: document.getElementById('limitingLegBadge'), designTargetBadge: document.getElementById('designTargetBadge'), totalReachBadge: document.getElementById('totalReachBadge'),
  legAPathLoss: document.getElementById('legAPathLoss'), legBPathLoss: document.getElementById('legBPathLoss'), legADistance: document.getElementById('legADistance'), legBDistance: document.getElementById('legBDistance'),
  scenarioLabel: document.getElementById('scenarioLabel'), insightBox: document.getElementById('insightBox'), notesBox: document.getElementById('notesBox'), relayModeLabel: document.getElementById('relayModeLabel'),
  legAPathLossLabel: document.getElementById('legAPathLossLabel'), legBPathLossLabel: document.getElementById('legBPathLossLabel'), legASubtitle: document.getElementById('legASubtitle'), legBSubtitle: document.getElementById('legBSubtitle'),
  legADistanceLabel: document.getElementById('legADistanceLabel'), legBDistanceLabel: document.getElementById('legBDistanceLabel'),
  gatewayTxWarning: document.getElementById('gatewayTxWarning')
};

const canvas = document.getElementById('coverageCanvas');
const ctx = canvas.getContext('2d');

function applyRegionDefaults() {
  const sliders = presets.region[state.region].sliders;
  for (const [key, cfg] of Object.entries(sliders)) {
    el[key].min = cfg.min;
    el[key].max = cfg.max;
    el[key].value = Math.min(cfg.value, cfg.max);
    el[key].step = 0.5;
  }
  el.gatewayHeight.value = 30;
  el.relayHeight.value = 6;
  el.deviceHeight.value = 1.5;
  el.relayPlacement.value = 50;
}

function syncLabels() {
  outputs.gatewayHeightValue.textContent = el.gatewayHeight.value;
  outputs.relayHeightValue.textContent = el.relayHeight.value;
  outputs.deviceHeightValue.textContent = el.deviceHeight.value;
  outputs.relayPlacementValue.textContent = el.relayPlacement.value;
  outputs.gatewayTxValue.textContent = Number(el.gatewayTx.value).toFixed(1);
  outputs.deviceTxValue.textContent = Number(el.deviceTx.value).toFixed(1);
  outputs.relayTxValue.textContent = Number(el.relayTx.value).toFixed(1);
  outputs.gatewaySensitivityValue.textContent = Number(el.gatewaySensitivity.value).toFixed(1);
  outputs.relaySensitivityValue.textContent = Number(el.relaySensitivity.value).toFixed(1);
  outputs.gatewayGainValue.textContent = Number(el.gatewayGain.value).toFixed(1);
  outputs.relayGainValue.textContent = Number(el.relayGain.value).toFixed(1);
}

function updateRelayVisibility() {
  document.querySelectorAll('.relay-only').forEach(node => node.classList.toggle('hidden', !state.useRelay));
  outputs.relayModeLabel.textContent = state.useRelay
    ? 'Gateway + Relay: modeling device-to-relay and relay-to-gateway links.'
    : 'Gateway only: using direct gateway-to-device terrain model.';

  outputs.legAPathLossLabel.textContent = state.useRelay ? 'Leg A path loss' : 'Direct path loss';
  outputs.legBPathLossLabel.textContent = state.useRelay ? 'Leg B path loss' : 'Gateway profile';
  outputs.legASubtitle.textContent = state.useRelay ? 'Device -> Relay' : 'Device -> Gateway';
  outputs.legBSubtitle.textContent = state.useRelay ? 'Relay -> Gateway' : 'Direct mode';
  outputs.legADistanceLabel.textContent = state.useRelay ? 'Leg A estimate' : 'Direct estimate';
  outputs.legBDistanceLabel.textContent = state.useRelay ? 'Leg B estimate' : 'Topology';
}

function bindChipGroup(groupId, key) {
  const buttons = [...document.querySelectorAll(`#${groupId} .chip`)];
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state[key] = btn.dataset[key];
    if (key === 'region') applyRegionDefaults();
    calculate();
  }));
}

function calculateAllowedPathLoss({ txPower, txAntennaGain, txLoss, rxAntennaGain, rxLoss, sensitivity, fade, clutter, misc }) {
  return txPower + txAntennaGain - txLoss + rxAntennaGain - rxLoss - sensitivity - fade - clutter - misc;
}

function radioHorizonKm(h1m, h2m) { return 3.57 * (Math.sqrt(Math.max(0.1, h1m)) + Math.sqrt(Math.max(0.1, h2m))); }

function heightDeltaDb(h1m, h2m, mode) {
  const sqrtTerm = Math.sqrt(Math.max(0.1, h1m)) + Math.sqrt(Math.max(0.1, h2m));
  const baseline = mode === 'direct' ? 8.2 : 6.2;
  return Math.max(-5, Math.min(10, (sqrtTerm - baseline) * (mode === 'direct' ? 2.1 : 1.8)));
}

function pathLossToDistanceKm({ allowedPathLoss, referencePathLoss, refDistanceKm, exponent, h1m, h2m, horizonFactor }) {
  const ratio = Math.pow(10, (allowedPathLoss - referencePathLoss) / (10 * exponent));
  return Math.max(0.05, Math.min(refDistanceKm * ratio, radioHorizonKm(h1m, h2m) * horizonFactor));
}

function formatDistance(km) { return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`; }
function formatDb(v) { return `${v.toFixed(1)} dB`; }

function updateWarnings() {
  const gatewayTx = parseFloat(el.gatewayTx.value);
  const gatewayGain = parseFloat(el.gatewayGain.value);
  const gatewayEirp = gatewayTx + gatewayGain;
  outputs.gatewayTxWarning.classList.add('hidden');

  if (state.region === 'EU868') {
    if (gatewayTx > 14) {
      outputs.gatewayTxWarning.textContent = '⚠️ Exceeds EU868 ETSI regulatory maximum of 14 dBm EIRP';
      outputs.gatewayTxWarning.classList.remove('hidden');
    }
  } else if (gatewayEirp > 30) {
    outputs.gatewayTxWarning.textContent = `⚠️ Exceeds US915 FCC regulatory maximum of 30 dBm EIRP (TX power + antenna gain = ${gatewayEirp.toFixed(1)} dBm)`;
    outputs.gatewayTxWarning.classList.remove('hidden');
  }
}

function renderDirectNotes(args) {
  return `
  <div class="note-block">
    <h4>Selected assumptions</h4>
    <dl>
      <dt>Gateway model</dt><dd>${state.gateway}</dd>
      <dt>Topology</dt><dd>Gateway</dd>
      <dt>Terrain profile</dt><dd>${args.terrain.label}</dd>
      <dt>Gateway note</dt><dd>${args.gatewayPreset.note}</dd>
      <dt>Range cap</dt><dd>Radio horizon x ${args.terrain.direct.horizonFactor.toFixed(2)}</dd>
    </dl>
  </div>
  <div class="note-block">
    <h4>Formula used</h4>
    <div class="formula-box">Allowed path loss = Tx power + Tx antenna gain - Tx cable loss + Rx antenna gain - Rx cable loss - Receiver sensitivity - Fade margin - Obstruction loss - Misc loss

Distance = reference distance x 10^((Allowed path loss - reference path loss) / (10 x path-loss exponent))
Capped by radio horizon and terrain horizon factor.</div>
  </div>
  <div class="note-block">
    <h4>Gateway model values</h4>
    <dl>
      <dt>Gateway TX power</dt><dd>${args.gatewayTx.toFixed(1)} dBm</dd>
      <dt>Tx cable / connector loss</dt><dd>${args.gatewayPreset.txLoss.toFixed(1)} dB</dd>
      <dt>Rx antenna gain</dt><dd>${args.gatewayGain.toFixed(1)} dBi</dd>
      <dt>Rx cable / connector loss</dt><dd>${args.gatewayPreset.rxLoss.toFixed(1)} dB</dd>
      <dt>Receiver sensitivity</dt><dd>${args.gatewaySensitivity.toFixed(1)} dBm</dd>
      <dt>Fade margin target</dt><dd>${args.terrain.direct.fade.toFixed(1)} dB</dd>
      <dt>Obstruction / clutter loss</dt><dd>${args.terrain.direct.clutter.toFixed(1)} dB</dd>
      <dt>Misc. implementation loss</dt><dd>${(args.terrain.direct.misc - args.gatewayPreset.miscBonus).toFixed(1)} dB</dd>
      <dt>Allowed path loss</dt><dd>${args.pathLoss.toFixed(1)} dB</dd>
    </dl>
  </div>
  <div class="note-block">
    <h4>Terrain profile values</h4>
    <dl>
      <dt>Reference distance</dt><dd>${args.terrain.direct.refDistanceKm.toFixed(1)} km</dd>
      <dt>Reference path loss</dt><dd>${args.terrain.direct.refPathLoss.toFixed(1)} dB</dd>
      <dt>Path-loss exponent</dt><dd>${args.terrain.direct.exponent.toFixed(2)}</dd>
      <dt>Gateway height</dt><dd>${args.gatewayHeight.toFixed(1)} m</dd>
      <dt>Device height</dt><dd>${args.deviceHeight.toFixed(1)} m</dd>
      <dt>Height adjustment</dt><dd>${args.heightAdj.toFixed(1)} dB</dd>
      <dt>Total reach shown</dt><dd>${formatDistance(args.distance)}</dd>
    </dl>
  </div>`;
}

function renderRelayNotes(args) {
  return `
  <div class="note-block">
    <h4>Selected assumptions</h4>
    <dl>
      <dt>Gateway model</dt><dd>${state.gateway}</dd>
      <dt>Topology</dt><dd>Gateway + Relay</dd>
      <dt>Terrain profile</dt><dd>${args.terrain.label}</dd>
      <dt>Gateway note</dt><dd>${args.gatewayPreset.note}</dd>
      <dt>Placement factor</dt><dd>${(args.placementPenalty * 100).toFixed(0)}%</dd>
    </dl>
  </div>
  <div class="note-block">
    <h4>Formula used</h4>
    <div class="formula-box">Allowed path loss = Tx power + Tx antenna gain - Tx cable loss + Rx antenna gain - Rx cable loss - Receiver sensitivity - Fade margin - Obstruction loss - Misc loss

Distance = reference distance x 10^((Allowed path loss - reference path loss) / (10 x path-loss exponent))
Each leg is capped by radio horizon and terrain horizon factor. Total reach = Leg A + Leg B.</div>
  </div>
  <div class="note-block">
    <h4>Leg A: Device -> Relay</h4>
    <dl>
      <dt>Tx cable / connector loss</dt><dd>0.0 dB</dd>
      <dt>Rx antenna gain</dt><dd>${args.relayGain.toFixed(1)} dBi</dd>
      <dt>Rx cable / connector loss</dt><dd>0.5 dB</dd>
      <dt>Receiver sensitivity</dt><dd>${args.relaySensitivity.toFixed(1)} dBm</dd>
      <dt>Fade margin target</dt><dd>${args.terrain.relayA.fade.toFixed(1)} dB</dd>
      <dt>Obstruction / clutter loss</dt><dd>${args.terrain.relayA.clutter.toFixed(1)} dB</dd>
      <dt>Misc. implementation loss</dt><dd>${args.terrain.relayA.misc.toFixed(1)} dB</dd>
      <dt>Reference path loss</dt><dd>${args.terrain.relayA.refPathLoss.toFixed(1)} dB</dd>
      <dt>Allowed path loss</dt><dd>${args.pathLossA.toFixed(1)} dB</dd>
    </dl>
  </div>
  <div class="note-block">
    <h4>Leg B: Relay -> Gateway</h4>
    <dl>
      <dt>Gateway TX power</dt><dd>${args.gatewayTx.toFixed(1)} dBm</dd>
      <dt>Tx cable / connector loss</dt><dd>${args.gatewayPreset.txLoss.toFixed(1)} dB</dd>
      <dt>Rx antenna gain</dt><dd>${args.gatewayGain.toFixed(1)} dBi</dd>
      <dt>Rx cable / connector loss</dt><dd>${args.gatewayPreset.rxLoss.toFixed(1)} dB</dd>
      <dt>Receiver sensitivity</dt><dd>${args.gatewaySensitivity.toFixed(1)} dBm</dd>
      <dt>Fade margin target</dt><dd>${args.terrain.relayB.fade.toFixed(1)} dB</dd>
      <dt>Obstruction / clutter loss</dt><dd>${args.terrain.relayB.clutter.toFixed(1)} dB</dd>
      <dt>Misc. implementation loss</dt><dd>${(args.terrain.relayB.misc - args.gatewayPreset.miscBonus).toFixed(1)} dB</dd>
      <dt>Reference path loss</dt><dd>${args.terrain.relayB.refPathLoss.toFixed(1)} dB</dd>
      <dt>Allowed path loss</dt><dd>${args.pathLossB.toFixed(1)} dB</dd>
    </dl>
  </div>`;
}

function calculate() {
  syncLabels();
  updateRelayVisibility();
  updateWarnings();

  const terrain = presets.terrain[state.terrain];
  const gatewayPreset = presets.gateway[state.gateway];
  const gatewayHeight = parseFloat(el.gatewayHeight.value);
  const relayHeight = parseFloat(el.relayHeight.value);
  const deviceHeight = parseFloat(el.deviceHeight.value);
  const relayPlacement = parseFloat(el.relayPlacement.value) / 100;
  const gatewayTx = parseFloat(el.gatewayTx.value);
  const deviceTx = parseFloat(el.deviceTx.value);
  const relayTx = parseFloat(el.relayTx.value);
  const gatewayGain = parseFloat(el.gatewayGain.value);
  const relayGain = parseFloat(el.relayGain.value);
  const gatewaySensitivity = parseFloat(el.gatewaySensitivity.value);
  const relaySensitivity = parseFloat(el.relaySensitivity.value);

  let designA = 0, designB = 0, totalReach = 0, pathLossA = 0, pathLossB = 0, limitingLeg = 'Gateway only', designTargetDb = 0;

  if (state.useRelay) {
    const baseA = calculateAllowedPathLoss({ txPower: deviceTx, txAntennaGain: 0, txLoss: 0, rxAntennaGain: relayGain, rxLoss: 0.5, sensitivity: relaySensitivity, fade: terrain.relayA.fade, clutter: terrain.relayA.clutter, misc: terrain.relayA.misc });
    const baseB = calculateAllowedPathLoss({ txPower: gatewayTx, txAntennaGain: gatewayGain, txLoss: gatewayPreset.txLoss, rxAntennaGain: relayGain, rxLoss: 0.5, sensitivity: relaySensitivity, fade: terrain.relayB.fade, clutter: terrain.relayB.clutter, misc: terrain.relayB.misc - gatewayPreset.miscBonus });
    const heightAdjA = heightDeltaDb(deviceHeight, relayHeight, 'relay');
    const heightAdjB = heightDeltaDb(relayHeight, gatewayHeight, 'relay');
    pathLossA = baseA + heightAdjA;
    pathLossB = baseB + heightAdjB;
    const placementPenalty = 0.9 + 0.2 * (1 - Math.abs(relayPlacement - 0.5) * 2);
    designA = pathLossToDistanceKm({ allowedPathLoss: pathLossA, referencePathLoss: terrain.relayA.refPathLoss, refDistanceKm: terrain.relayA.refDistanceKm, exponent: terrain.relayA.exponent, h1m: deviceHeight, h2m: relayHeight, horizonFactor: terrain.relayA.horizonFactor }) * placementPenalty;
    designB = pathLossToDistanceKm({ allowedPathLoss: pathLossB, referencePathLoss: terrain.relayB.refPathLoss, refDistanceKm: terrain.relayB.refDistanceKm, exponent: terrain.relayB.exponent, h1m: relayHeight, h2m: gatewayHeight, horizonFactor: terrain.relayB.horizonFactor }) * placementPenalty;
    totalReach = designA + designB;
    limitingLeg = designA <= designB ? 'Leg A' : 'Leg B';
    designTargetDb = Math.min(pathLossA, pathLossB) - 8;
    outputs.notesBox.innerHTML = renderRelayNotes({ terrain, gatewayPreset, gatewayTx, relayGain, relaySensitivity, gatewayGain, gatewaySensitivity, pathLossA, pathLossB, placementPenalty });
  } else {
    const baseDirect = calculateAllowedPathLoss({ txPower: gatewayTx, txAntennaGain: gatewayGain, txLoss: gatewayPreset.txLoss, rxAntennaGain: 0, rxLoss: 0, sensitivity: gatewaySensitivity, fade: terrain.direct.fade, clutter: terrain.direct.clutter, misc: terrain.direct.misc - gatewayPreset.miscBonus });
    const heightAdj = heightDeltaDb(deviceHeight, gatewayHeight, 'direct');
    pathLossA = baseDirect + heightAdj;
    pathLossB = pathLossA;
    designA = pathLossToDistanceKm({ allowedPathLoss: pathLossA, referencePathLoss: terrain.direct.refPathLoss, refDistanceKm: terrain.direct.refDistanceKm, exponent: terrain.direct.exponent, h1m: deviceHeight, h2m: gatewayHeight, horizonFactor: terrain.direct.horizonFactor });
    designB = 0;
    totalReach = designA;
    designTargetDb = pathLossA - 8;
    outputs.notesBox.innerHTML = renderDirectNotes({ terrain, gatewayPreset, gatewayTx, gatewayGain, gatewaySensitivity, pathLoss: pathLossA, gatewayHeight, deviceHeight, heightAdj, distance: designA });
  }

  outputs.legAPathLoss.textContent = formatDb(pathLossA);
  outputs.legBPathLoss.textContent = state.useRelay ? formatDb(pathLossB) : state.gateway;
  outputs.legADistance.textContent = formatDistance(designA);
  outputs.legBDistance.textContent = state.useRelay ? formatDistance(designB) : 'Gateway';
  outputs.limitingLegBadge.textContent = limitingLeg;
  outputs.designTargetBadge.textContent = formatDb(designTargetDb);
  outputs.totalReachBadge.textContent = formatDistance(totalReach);
  outputs.scenarioLabel.textContent = `${state.region} · ${state.gateway} · ${terrain.label} · ${state.useRelay ? 'Gateway + Relay' : 'Gateway'}`;
  outputs.insightBox.innerHTML = state.useRelay
    ? `<strong>${gatewayPreset.note}</strong><br>The weaker of the two legs sets the ceiling. Changes to TX power, antenna gain, sensitivity, and antenna heights all feed the distance estimate through allowed path loss and the terrestrial horizon cap.`
    : `<strong>${gatewayPreset.note}</strong><br>Direct topology uses a terrain-limited terrestrial model, not raw free-space distance. Gateway TX, antenna gain, sensitivity, and antenna heights all affect the reach estimate.`;

  drawMap({ terrain, designA, designB, totalReach, relayPlacement, gatewayHeight, relayHeight, deviceHeight, useRelay: state.useRelay, limitingLeg });
}

function drawMap({ terrain, designA, designB, totalReach, relayPlacement, gatewayHeight, relayHeight, deviceHeight, useRelay, limitingLeg }) {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, terrain.bg); gradient.addColorStop(1, '#08111d');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  drawTerrain();
  const margin = 90, gatewayX = 180, gatewayY = h / 2 - 40;
  const maxVisualKm = Math.max(totalReach, designA, designB, 1) * 1.18;
  const pxPerKm = (w - margin * 2) / maxVisualKm;
  const relayOffsetKm = useRelay ? designB * 0.65 : 0;
  const relayX = Math.min(w - margin - 160, gatewayX + relayOffsetKm * pxPerKm);
  const relayY = h / 2 + 80;
  const deviceOffsetKm = useRelay ? designA * Math.max(0.72, Math.min(1.18, 1 + (relayPlacement - 0.5) * 0.55)) : designA;
  const deviceX = Math.min(w - margin, (useRelay ? relayX : gatewayX) + deviceOffsetKm * pxPerKm);
  const deviceY = h / 2 - 10;
  if (useRelay) {
    drawRangeRings(gatewayX, gatewayY, designB * pxPerKm, 'rgba(120,211,255,0.14)', 'rgba(120,211,255,0.36)');
    drawRangeRings(relayX, relayY, designA * pxPerKm, 'rgba(158,255,181,0.14)', 'rgba(158,255,181,0.34)');
  } else {
    drawRangeRings(gatewayX, gatewayY, designA * pxPerKm, 'rgba(120,211,255,0.14)', 'rgba(120,211,255,0.36)');
  }
  ctx.setLineDash([12, 10]); ctx.strokeStyle = 'rgba(255,213,106,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gatewayX, gatewayY);
  if (useRelay) ctx.lineTo(relayX, relayY);
  ctx.lineTo(deviceX, deviceY); ctx.stroke(); ctx.setLineDash([]);
  drawNode(gatewayX, gatewayY, 18, '#78d3ff', `Gateway\n${Math.round(gatewayHeight)}m`);
  if (useRelay) drawNode(relayX, relayY, 14, '#9effb5', `Relay\n${Math.round(relayHeight)}m`);
  drawNode(deviceX, deviceY, 10, '#ffd56a', `Device\n${deviceHeight.toFixed(1)}m`);
  ctx.fillStyle = 'rgba(233,241,251,0.95)'; ctx.font = '600 16px Inter, sans-serif';
  if (useRelay) { ctx.fillText(`Leg B: ${formatDistance(designB)}`, gatewayX + 24, gatewayY - 24); ctx.fillText(`Leg A: ${formatDistance(designA)}`, relayX + 20, relayY - 18); }
  else { ctx.fillText(`Direct: ${formatDistance(designA)}`, gatewayX + 24, gatewayY - 24); }
  ctx.font = '700 18px Inter, sans-serif'; ctx.fillText(`Estimated total: ${formatDistance(totalReach)}`, 28, 36);
  ctx.font = '600 15px Inter, sans-serif'; ctx.fillStyle = limitingLeg === 'Leg A' ? '#9effb5' : '#78d3ff'; ctx.fillText(`${limitingLeg} is limiting`, 28, 62);
  drawScale(w, h, maxVisualKm, pxPerKm);
}

function drawRangeRings(cx, cy, radius, fill, stroke) { for (let i = 1; i <= 3; i++) { const r = radius * (i / 3); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.3; ctx.fill(); ctx.stroke(); } }
function drawNode(x, y, radius, color, label) { ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2; ctx.stroke(); const [l1,l2]=label.split('\n'); ctx.fillStyle='#f4f8fd'; ctx.font='700 15px Inter, sans-serif'; ctx.fillText(l1, x-22, y+34); ctx.font='500 13px Inter, sans-serif'; ctx.fillText(l2, x-16, y+52); }
function drawTerrain() { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 14; i++) { const x = 50 + i * 68; const y = 510 + Math.sin(i * 0.75) * 18; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20, y - 60); ctx.lineTo(x + 36, y); ctx.closePath(); ctx.fill(); } ctx.restore(); }
function drawScale(w,h,maxVisualKm,pxPerKm) { const y=h-42, x0=30, x1=w-30; ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke(); const steps=5; for (let i=0;i<=steps;i++){ const x=x0+((x1-x0)/steps)*i; ctx.beginPath(); ctx.moveTo(x,y-8); ctx.lineTo(x,y+8); ctx.stroke(); const km=((x-x0)/pxPerKm).toFixed(0); ctx.fillStyle='rgba(233,241,251,0.8)'; ctx.font='500 12px Inter, sans-serif'; ctx.fillText(`${km} km`, x-10, y-14); } }

function addListeners() {
  bindChipGroup('regionGroup', 'region');
  bindChipGroup('gatewayGroup', 'gateway');
  bindChipGroup('terrainGroup', 'terrain');
  document.getElementById('useRelayToggle').addEventListener('change', (e) => { state.useRelay = e.target.checked; calculate(); });
  Object.values(el).forEach(input => input.addEventListener('input', calculate));
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.region = 'EU868'; state.gateway = 'Macro'; state.terrain = 'open'; state.useRelay = false;
    document.getElementById('useRelayToggle').checked = false;
    document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
    document.querySelector('[data-region="EU868"]').classList.add('active');
    document.querySelector('[data-gateway="Macro"]').classList.add('active');
    document.querySelector('[data-terrain="open"]').classList.add('active');
    applyRegionDefaults(); calculate();
  });
}

applyRegionDefaults();
addListeners();
calculate();
