export const presets = {
  region: {
    EU868: {
      frequencyMHz: 868,
      sliders: {
        gatewayTx:        { min: 0,    max: 27,     value: 14,   unit: 'dBm' },
        deviceTx:         { min: 2,    max: 14,     value: 14,   unit: 'dBm' },
        relayTx:          { min: 2,    max: 14,     value: 14,   unit: 'dBm' },
        gatewayGain:      { min: 0,    max: 8,      value: 6,    unit: 'dBi' },
        relayGain:        { min: 0,    max: 8,      value: 2,    unit: 'dBi' },
        gatewaySensitivity: { min: -142, max: -127.5, value: -142, unit: 'dBm' },
        relaySensitivity:   { min: -141, max: -123,  value: -133, unit: 'dBm' },
      },
    },
    US915: {
      frequencyMHz: 915,
      sliders: {
        gatewayTx:        { min: 0,    max: 27,     value: 28,   unit: 'dBm' },
        deviceTx:         { min: 0,    max: 30,     value: 30,   unit: 'dBm' },
        relayTx:          { min: 0,    max: 22,     value: 22,   unit: 'dBm' },
        gatewayGain:      { min: 0,    max: 8,      value: 6,    unit: 'dBi' },
        relayGain:        { min: 0,    max: 8,      value: 2,    unit: 'dBi' },
        gatewaySensitivity: { min: -142, max: -127.5, value: -142, unit: 'dBm' },
        relaySensitivity:   { min: -141, max: -123,  value: -133, unit: 'dBm' },
      },
    },
  },
  gateway: {
    Macro: { txLoss: 1.0, rxLoss: 1.0, miscBonus: 0.0, note: 'Balanced gateway profile.' },
    Mega:  { txLoss: 1.0, rxLoss: 1.0, miscBonus: 1.5, note: 'Stronger edge profile with extra gateway-side margin.' },
  },
  terrain: {
    open: {
      label: 'Open rural', bg: '#18324d',
      direct: { fade: 12, clutter: 4,  misc: 3, refDistanceKm: 8.5,  refPathLoss: 134, exponent: 3.05, horizonFactor: 0.92 },
      relayA: { fade: 10, clutter: 4,  misc: 3, refDistanceKm: 3.0,  refPathLoss: 126, exponent: 3.0,  horizonFactor: 0.94 },
      relayB: { fade: 10, clutter: 3,  misc: 3, refDistanceKm: 10.0, refPathLoss: 140, exponent: 3.0,  horizonFactor: 0.95 },
    },
    suburban: {
      label: 'Suburban', bg: '#2b3f52',
      direct: { fade: 15, clutter: 9,  misc: 4, refDistanceKm: 3.5,  refPathLoss: 128, exponent: 3.45, horizonFactor: 0.84 },
      relayA: { fade: 13, clutter: 8,  misc: 4, refDistanceKm: 1.6,  refPathLoss: 121, exponent: 3.4,  horizonFactor: 0.86 },
      relayB: { fade: 14, clutter: 7,  misc: 4, refDistanceKm: 4.5,  refPathLoss: 132, exponent: 3.35, horizonFactor: 0.87 },
    },
    urban: {
      label: 'Urban / industrial', bg: '#3d3d47',
      direct: { fade: 18, clutter: 14, misc: 5, refDistanceKm: 1.5,  refPathLoss: 123, exponent: 3.9,  horizonFactor: 0.76 },
      relayA: { fade: 17, clutter: 12, misc: 5, refDistanceKm: 0.9,  refPathLoss: 118, exponent: 3.8,  horizonFactor: 0.78 },
      relayB: { fade: 17, clutter: 11, misc: 5, refDistanceKm: 2.1,  refPathLoss: 127, exponent: 3.7,  horizonFactor: 0.79 },
    },
    dense: {
      label: 'Dense obstruction', bg: '#443438',
      direct: { fade: 22, clutter: 18, misc: 6, refDistanceKm: 0.55, refPathLoss: 118, exponent: 4.35, horizonFactor: 0.68 },
      relayA: { fade: 20, clutter: 16, misc: 6, refDistanceKm: 0.4,  refPathLoss: 114, exponent: 4.15, horizonFactor: 0.71 },
      relayB: { fade: 21, clutter: 15, misc: 6, refDistanceKm: 0.85, refPathLoss: 121, exponent: 4.05, horizonFactor: 0.72 },
    },
  },
}

export function calculateAllowedPathLoss({ txPower, txAntennaGain, txLoss, rxAntennaGain, rxLoss, sensitivity, fade, clutter, misc }) {
  return txPower + txAntennaGain - txLoss + rxAntennaGain - rxLoss - sensitivity - fade - clutter - misc
}

export function radioHorizonKm(h1m, h2m) {
  return 3.57 * (Math.sqrt(Math.max(0.1, h1m)) + Math.sqrt(Math.max(0.1, h2m)))
}

export function heightDeltaDb(h1m, h2m, mode) {
  const sqrtTerm = Math.sqrt(Math.max(0.1, h1m)) + Math.sqrt(Math.max(0.1, h2m))
  const baseline = mode === 'direct' ? 8.2 : 6.2
  return Math.max(-5, Math.min(10, (sqrtTerm - baseline) * (mode === 'direct' ? 2.1 : 1.8)))
}

export function pathLossToDistanceKm({ allowedPathLoss, referencePathLoss, refDistanceKm, exponent, h1m, h2m, horizonFactor }) {
  const ratio = Math.pow(10, (allowedPathLoss - referencePathLoss) / (10 * exponent))
  return Math.max(0.05, Math.min(refDistanceKm * ratio, radioHorizonKm(h1m, h2m) * horizonFactor))
}

export function formatDistance(km) {
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`
}

export function formatDb(v) {
  return `${v.toFixed(1)} dB`
}

export function getInitialSliderValues(region) {
  const sliders = presets.region[region].sliders
  return Object.fromEntries(
    Object.entries(sliders).map(([key, cfg]) => [key, Math.min(cfg.value, cfg.max)])
  )
}

export function computeResults(state) {
  const {
    region, gateway, terrain: terrainKey, useRelay,
    gatewayHeight, relayHeight, deviceHeight, relayPlacement,
    gatewayTx, deviceTx, relayTx, gatewayGain, relayGain,
    gatewaySensitivity, relaySensitivity,
  } = state

  const terrain = presets.terrain[terrainKey]
  const gatewayPreset = presets.gateway[gateway]
  const placementFrac = relayPlacement / 100

  let designA = 0, designB = 0, totalReach = 0
  let pathLossA = 0, pathLossB = 0
  let limitingLeg = 'Gateway only'
  let designTargetDb = 0
  let placementPenalty = 1
  let heightAdj = 0

  if (useRelay) {
    const baseA = calculateAllowedPathLoss({
      txPower: deviceTx, txAntennaGain: 0, txLoss: 0,
      rxAntennaGain: relayGain, rxLoss: 0.5,
      sensitivity: relaySensitivity,
      fade: terrain.relayA.fade, clutter: terrain.relayA.clutter, misc: terrain.relayA.misc,
    })
    const baseB = calculateAllowedPathLoss({
      txPower: gatewayTx, txAntennaGain: gatewayGain, txLoss: gatewayPreset.txLoss,
      rxAntennaGain: relayGain, rxLoss: 0.5,
      sensitivity: relaySensitivity,
      fade: terrain.relayB.fade, clutter: terrain.relayB.clutter,
      misc: terrain.relayB.misc - gatewayPreset.miscBonus,
    })
    const heightAdjA = heightDeltaDb(deviceHeight, relayHeight, 'relay')
    const heightAdjB = heightDeltaDb(relayHeight, gatewayHeight, 'relay')
    pathLossA = baseA + heightAdjA
    pathLossB = baseB + heightAdjB
    placementPenalty = 0.9 + 0.2 * (1 - Math.abs(placementFrac - 0.5) * 2)
    designA = pathLossToDistanceKm({
      allowedPathLoss: pathLossA, referencePathLoss: terrain.relayA.refPathLoss,
      refDistanceKm: terrain.relayA.refDistanceKm, exponent: terrain.relayA.exponent,
      h1m: deviceHeight, h2m: relayHeight, horizonFactor: terrain.relayA.horizonFactor,
    }) * placementPenalty
    designB = pathLossToDistanceKm({
      allowedPathLoss: pathLossB, referencePathLoss: terrain.relayB.refPathLoss,
      refDistanceKm: terrain.relayB.refDistanceKm, exponent: terrain.relayB.exponent,
      h1m: relayHeight, h2m: gatewayHeight, horizonFactor: terrain.relayB.horizonFactor,
    }) * placementPenalty
    totalReach = designA + designB
    limitingLeg = designA <= designB ? 'Leg A' : 'Leg B'
    designTargetDb = Math.min(pathLossA, pathLossB) - 8
  } else {
    const baseDirect = calculateAllowedPathLoss({
      txPower: gatewayTx, txAntennaGain: gatewayGain, txLoss: gatewayPreset.txLoss,
      rxAntennaGain: 0, rxLoss: 0,
      sensitivity: gatewaySensitivity,
      fade: terrain.direct.fade, clutter: terrain.direct.clutter,
      misc: terrain.direct.misc - gatewayPreset.miscBonus,
    })
    heightAdj = heightDeltaDb(deviceHeight, gatewayHeight, 'direct')
    pathLossA = baseDirect + heightAdj
    pathLossB = pathLossA
    designA = pathLossToDistanceKm({
      allowedPathLoss: pathLossA, referencePathLoss: terrain.direct.refPathLoss,
      refDistanceKm: terrain.direct.refDistanceKm, exponent: terrain.direct.exponent,
      h1m: deviceHeight, h2m: gatewayHeight, horizonFactor: terrain.direct.horizonFactor,
    })
    designB = 0
    totalReach = designA
    designTargetDb = pathLossA - 8
  }

  const gwEirp = gatewayTx + gatewayGain
  let gatewayTxWarning = null
  if (region === 'EU868' && gatewayTx > 14) {
    gatewayTxWarning = '⚠️ Exceeds EU868 ETSI regulatory maximum of 14 dBm EIRP'
  } else if (region === 'US915' && gwEirp > 30) {
    gatewayTxWarning = `⚠️ Exceeds US915 FCC regulatory maximum of 30 dBm EIRP (TX power + antenna gain = ${gwEirp.toFixed(1)} dBm)`
  }

  return {
    designA, designB, totalReach, pathLossA, pathLossB,
    limitingLeg, designTargetDb, placementPenalty, heightAdj,
    gatewayTxWarning, terrain, gatewayPreset,
  }
}
