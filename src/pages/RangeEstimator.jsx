import { useRef, useEffect, useState } from 'react'
import { presets, computeResults, getInitialSliderValues, formatDistance, formatDb } from '../lib/lorawan.js'
import { drawMap } from '../lib/drawMap.js'
import { useShareableState } from '../hooks/useShareableState.js'
import './RangeEstimator.css'

function getInitialState() {
  const sliders = getInitialSliderValues('EU868')
  return {
    region: 'EU868',
    gateway: 'Macro',
    terrain: 'open',
    useRelay: false,
    gatewayHeight: 30,
    relayHeight: 6,
    deviceHeight: 1.5,
    relayPlacement: 50,
    ...sliders,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.key]: action.value }
    case 'SET_REGION': {
      const sliders = getInitialSliderValues(action.region)
      return { ...state, region: action.region, ...sliders }
    }
    case 'RESET':
      return getInitialState()
    default:
      return state
  }
}

export default function RangeEstimator() {
  const [state, dispatch] = useShareableState(reducer, getInitialState)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const results = computeResults(state)
  const sliderCfg = presets.region[state.region].sliders
  const terrain = presets.terrain[state.terrain]

  useEffect(() => {
    if (canvasRef.current) {
      drawMap(canvasRef.current, {
        terrain: results.terrain,
        designA: results.designA,
        designB: results.designB,
        totalReach: results.totalReach,
        limitingLeg: results.limitingLeg,
        gatewayHeight: state.gatewayHeight,
        relayHeight: state.relayHeight,
        deviceHeight: state.deviceHeight,
        useRelay: state.useRelay,
      })
    }
  })

  function set(key) {
    return e => dispatch({ type: 'SET', key, value: parseFloat(e.target.value) })
  }

  const scenarioLabel = `${state.region} · ${state.gateway} · ${terrain.label} · ${state.useRelay ? 'Gateway + Relay' : 'Gateway'}`

  return (
    <div className="re-shell">
      <header className="re-hero">
        <div>
          <p className="re-eyebrow">Local planning tool</p>
          <h1 className="re-h1">LoRaWAN Relay Visual Planner</h1>
          <p className="re-subtitle">
            Compare KONA Macro and Mega, change terrain and antenna assumptions, and visualize
            device, relay, and gateway coverage as concentric range rings.
          </p>
        </div>
        <div className="re-hero-stats">
          <div className="re-stat-card">
            <span>Limiting link</span>
            <strong>{results.limitingLeg}</strong>
          </div>
          <div className="re-stat-card">
            <span>Design target</span>
            <strong>{formatDb(results.designTargetDb)}</strong>
          </div>
          <div className="re-stat-card">
            <span>Estimated total reach</span>
            <strong>{formatDistance(results.totalReach)}</strong>
          </div>
          <button className={`re-copy-btn${copied ? ' re-copy-btn-success' : ''}`} onClick={handleCopy}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" />
              <rect x="6" y="2" width="7" height="7" rx="1" />
            </svg>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </header>

      <div className="re-layout">
        {/* Controls panel */}
        <section className="re-card re-controls">
          <div className="re-title-row">
            <h2>Core assumptions</h2>
            <button className="re-ghost-btn" onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
          </div>

          <div className="re-control-block">
            <label className="re-block-label">Region</label>
            <div className="re-chip-group">
              {['EU868', 'US915'].map(r => (
                <button
                  key={r}
                  className={`re-chip${state.region === r ? ' active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_REGION', region: r })}
                >{r}</button>
              ))}
            </div>
          </div>

          <div className="re-control-block">
            <label className="re-block-label">Gateway model</label>
            <div className="re-chip-group">
              {['Macro', 'Mega'].map(g => (
                <button
                  key={g}
                  className={`re-chip${state.gateway === g ? ' active' : ''}`}
                  onClick={() => dispatch({ type: 'SET', key: 'gateway', value: g })}
                >KONA {g}</button>
              ))}
            </div>
          </div>

          <div className="re-control-block">
            <label className="re-block-label">Terrain profile</label>
            <div className="re-chip-group re-chip-wrap">
              {Object.entries(presets.terrain).map(([key, t]) => (
                <button
                  key={key}
                  className={`re-chip${state.terrain === key ? ' active' : ''}`}
                  onClick={() => dispatch({ type: 'SET', key: 'terrain', value: key })}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div className="re-control-block">
            <label className="re-block-label">Topology</label>
            <div className="re-toggle-row">
              <span>Gateway</span>
              <label className="re-switch">
                <input
                  type="checkbox"
                  checked={state.useRelay}
                  onChange={e => dispatch({ type: 'SET', key: 'useRelay', value: e.target.checked })}
                />
                <span className="re-slider" />
              </label>
              <span>Gateway + Relay</span>
            </div>
            <p className="re-toggle-help">
              {state.useRelay
                ? 'Gateway + Relay: modeling device-to-relay and relay-to-gateway links.'
                : 'Gateway only: using direct gateway-to-device terrain model.'}
            </p>
          </div>

          <div className="re-grid re-two-up">
            <SliderCard label="Gateway antenna height" unit="m" value={state.gatewayHeight} min={5} max={80} step={1} onChange={set('gatewayHeight')} />
            {state.useRelay && <SliderCard label="Relay antenna height" unit="m" value={state.relayHeight} min={1} max={25} step={1} onChange={set('relayHeight')} />}
            <SliderCard label="End-device height" unit="m" value={state.deviceHeight} min={0.5} max={8} step={0.5} onChange={set('deviceHeight')} />
            {state.useRelay && <SliderCard label="Relay placement" unit="% of path" value={state.relayPlacement} min={20} max={80} step={1} onChange={set('relayPlacement')} />}
          </div>

          <div className="re-grid re-two-up re-section-gap">
            <SliderCard
              label="Gateway TX power" unit="dBm"
              value={state.gatewayTx} min={sliderCfg.gatewayTx.min} max={sliderCfg.gatewayTx.max} step={0.5}
              onChange={set('gatewayTx')}
              warning={results.gatewayTxWarning}
            />
            <SliderCard
              label="End-device TX power" unit="dBm"
              value={state.deviceTx} min={sliderCfg.deviceTx.min} max={sliderCfg.deviceTx.max} step={0.5}
              onChange={set('deviceTx')}
            />
            <SliderCard
              label="GW antenna gain" unit="dBi"
              value={state.gatewayGain} min={sliderCfg.gatewayGain.min} max={sliderCfg.gatewayGain.max} step={0.5}
              onChange={set('gatewayGain')}
            />
            {state.useRelay && (
              <SliderCard
                label="Relay TX power" unit="dBm"
                value={state.relayTx} min={sliderCfg.relayTx.min} max={sliderCfg.relayTx.max} step={0.5}
                onChange={set('relayTx')}
              />
            )}
            {state.useRelay && (
              <SliderCard
                label="Relay antenna gain" unit="dBi"
                value={state.relayGain} min={sliderCfg.relayGain.min} max={sliderCfg.relayGain.max} step={0.5}
                onChange={set('relayGain')}
              />
            )}
            <SliderCard
              label="GW RX sensitivity" unit="dBm"
              value={state.gatewaySensitivity} min={sliderCfg.gatewaySensitivity.min} max={sliderCfg.gatewaySensitivity.max} step={0.5}
              onChange={set('gatewaySensitivity')}
            />
            {state.useRelay && (
              <SliderCard
                label="Relay RX sensitivity" unit="dBm"
                value={state.relaySensitivity} min={sliderCfg.relaySensitivity.min} max={sliderCfg.relaySensitivity.max} step={0.5}
                onChange={set('relaySensitivity')}
              />
            )}
          </div>
        </section>

        {/* Visual panel */}
        <section className="re-card re-visual">
          <div className="re-title-row">
            <h2>Coverage view</h2>
            <p className="re-scenario-label">{scenarioLabel}</p>
          </div>

          <div className="re-map-stage">
            <canvas ref={canvasRef} width={960} height={680} aria-label="Coverage map" />
            <div className="re-map-legend">
              <div><span className="re-swatch re-swatch-gw" /> Gateway coverage</div>
              {state.useRelay && <div><span className="re-swatch re-swatch-relay" /> Relay coverage</div>}
              <div><span className="re-swatch re-swatch-total" /> Estimated total reach</div>
            </div>
          </div>

          <div className="re-metrics-grid">
            <article className="re-metric-card">
              <span>{state.useRelay ? 'Leg A path loss' : 'Direct path loss'}</span>
              <strong>{formatDb(results.pathLossA)}</strong>
              <small>{state.useRelay ? 'Device → Relay' : 'Device → Gateway'}</small>
            </article>
            <article className="re-metric-card">
              <span>{state.useRelay ? 'Leg B path loss' : 'Gateway profile'}</span>
              <strong>{state.useRelay ? formatDb(results.pathLossB) : state.gateway}</strong>
              <small>{state.useRelay ? 'Relay → Gateway' : 'Direct mode'}</small>
            </article>
            <article className="re-metric-card">
              <span>{state.useRelay ? 'Leg A estimate' : 'Direct estimate'}</span>
              <strong>{formatDistance(results.designA)}</strong>
              <small>Usable design reach</small>
            </article>
            <article className="re-metric-card">
              <span>{state.useRelay ? 'Leg B estimate' : 'Topology'}</span>
              <strong>{state.useRelay ? formatDistance(results.designB) : 'Gateway'}</strong>
              <small>Usable design reach</small>
            </article>
          </div>

          <div className="re-insight-box">
            <strong>{results.gatewayPreset.note}</strong>
            <br />
            {state.useRelay
              ? 'The weaker of the two legs sets the ceiling. Changes to TX power, antenna gain, sensitivity, and antenna heights all feed the distance estimate through allowed path loss and the terrestrial horizon cap.'
              : 'Direct topology uses a terrain-limited terrestrial model, not raw free-space distance. Gateway TX, antenna gain, sensitivity, and antenna heights all affect the reach estimate.'}
          </div>

          <section className="re-card re-notes-card">
            <div className="re-title-row re-mini-title">
              <h3>Notes and assumptions</h3>
            </div>
            <div className="re-notes-grid">
              {state.useRelay
                ? <RelayNotes state={state} results={results} />
                : <DirectNotes state={state} results={results} />}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}

function SliderCard({ label, unit, value, min, max, step, onChange, warning }) {
  const display = Number.isInteger(step) ? value : Number(value).toFixed(1)
  return (
    <label className="re-input-card">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
      <strong>{display} {unit}</strong>
      {warning && <div className="re-warning-banner">{warning}</div>}
    </label>
  )
}

function DirectNotes({ state, results }) {
  const { terrain, gatewayPreset, pathLossA: pathLoss, heightAdj } = results
  const { gateway, gatewayTx, gatewayGain, gatewaySensitivity, gatewayHeight, deviceHeight } = state
  return (
    <>
      <div className="re-note-block">
        <h4>Selected assumptions</h4>
        <dl>
          <dt>Gateway model</dt><dd>{gateway}</dd>
          <dt>Topology</dt><dd>Gateway</dd>
          <dt>Terrain profile</dt><dd>{terrain.label}</dd>
          <dt>Gateway note</dt><dd>{gatewayPreset.note}</dd>
          <dt>Range cap</dt><dd>Radio horizon × {terrain.direct.horizonFactor.toFixed(2)}</dd>
        </dl>
      </div>
      <div className="re-note-block">
        <h4>Formula used</h4>
        <div className="re-formula-box">
          {`Allowed path loss = Tx power + Tx antenna gain - Tx cable loss + Rx antenna gain - Rx cable loss - Receiver sensitivity - Fade margin - Obstruction loss - Misc loss\n\nDistance = reference distance × 10^((Allowed path loss - reference path loss) / (10 × path-loss exponent))\nCapped by radio horizon and terrain horizon factor.`}
        </div>
      </div>
      <div className="re-note-block">
        <h4>Gateway model values</h4>
        <dl>
          <dt>Gateway TX power</dt><dd>{gatewayTx.toFixed(1)} dBm</dd>
          <dt>Tx cable / connector loss</dt><dd>{gatewayPreset.txLoss.toFixed(1)} dB</dd>
          <dt>Rx antenna gain</dt><dd>{gatewayGain.toFixed(1)} dBi</dd>
          <dt>Rx cable / connector loss</dt><dd>{gatewayPreset.rxLoss.toFixed(1)} dB</dd>
          <dt>Receiver sensitivity</dt><dd>{gatewaySensitivity.toFixed(1)} dBm</dd>
          <dt>Fade margin target</dt><dd>{terrain.direct.fade.toFixed(1)} dB</dd>
          <dt>Obstruction / clutter loss</dt><dd>{terrain.direct.clutter.toFixed(1)} dB</dd>
          <dt>Misc. implementation loss</dt><dd>{(terrain.direct.misc - gatewayPreset.miscBonus).toFixed(1)} dB</dd>
          <dt>Allowed path loss</dt><dd>{pathLoss.toFixed(1)} dB</dd>
        </dl>
      </div>
      <div className="re-note-block">
        <h4>Terrain profile values</h4>
        <dl>
          <dt>Reference distance</dt><dd>{terrain.direct.refDistanceKm.toFixed(1)} km</dd>
          <dt>Reference path loss</dt><dd>{terrain.direct.refPathLoss.toFixed(1)} dB</dd>
          <dt>Path-loss exponent</dt><dd>{terrain.direct.exponent.toFixed(2)}</dd>
          <dt>Gateway height</dt><dd>{gatewayHeight.toFixed(1)} m</dd>
          <dt>Device height</dt><dd>{deviceHeight.toFixed(1)} m</dd>
          <dt>Height adjustment</dt><dd>{heightAdj.toFixed(1)} dB</dd>
          <dt>Total reach shown</dt><dd>{formatDistance(results.designA)}</dd>
        </dl>
      </div>
    </>
  )
}

function RelayNotes({ state, results }) {
  const { terrain, gatewayPreset, pathLossA, pathLossB, placementPenalty } = results
  const { gateway, gatewayTx, gatewayGain, gatewaySensitivity, relayGain, relaySensitivity } = state
  return (
    <>
      <div className="re-note-block">
        <h4>Selected assumptions</h4>
        <dl>
          <dt>Gateway model</dt><dd>{gateway}</dd>
          <dt>Topology</dt><dd>Gateway + Relay</dd>
          <dt>Terrain profile</dt><dd>{terrain.label}</dd>
          <dt>Gateway note</dt><dd>{gatewayPreset.note}</dd>
          <dt>Placement factor</dt><dd>{(placementPenalty * 100).toFixed(0)}%</dd>
        </dl>
      </div>
      <div className="re-note-block">
        <h4>Formula used</h4>
        <div className="re-formula-box">
          {`Allowed path loss = Tx power + Tx antenna gain - Tx cable loss + Rx antenna gain - Rx cable loss - Receiver sensitivity - Fade margin - Obstruction loss - Misc loss\n\nDistance = reference distance × 10^((Allowed path loss - reference path loss) / (10 × path-loss exponent))\nEach leg is capped by radio horizon and terrain horizon factor. Total reach = Leg A + Leg B.`}
        </div>
      </div>
      <div className="re-note-block">
        <h4>Leg A: Device → Relay</h4>
        <dl>
          <dt>Tx cable / connector loss</dt><dd>0.0 dB</dd>
          <dt>Rx antenna gain</dt><dd>{relayGain.toFixed(1)} dBi</dd>
          <dt>Rx cable / connector loss</dt><dd>0.5 dB</dd>
          <dt>Receiver sensitivity</dt><dd>{relaySensitivity.toFixed(1)} dBm</dd>
          <dt>Fade margin target</dt><dd>{terrain.relayA.fade.toFixed(1)} dB</dd>
          <dt>Obstruction / clutter loss</dt><dd>{terrain.relayA.clutter.toFixed(1)} dB</dd>
          <dt>Misc. implementation loss</dt><dd>{terrain.relayA.misc.toFixed(1)} dB</dd>
          <dt>Reference path loss</dt><dd>{terrain.relayA.refPathLoss.toFixed(1)} dB</dd>
          <dt>Allowed path loss</dt><dd>{pathLossA.toFixed(1)} dB</dd>
        </dl>
      </div>
      <div className="re-note-block">
        <h4>Leg B: Relay → Gateway</h4>
        <dl>
          <dt>Gateway TX power</dt><dd>{gatewayTx.toFixed(1)} dBm</dd>
          <dt>Tx cable / connector loss</dt><dd>{gatewayPreset.txLoss.toFixed(1)} dB</dd>
          <dt>Rx antenna gain</dt><dd>{gatewayGain.toFixed(1)} dBi</dd>
          <dt>Rx cable / connector loss</dt><dd>{gatewayPreset.rxLoss.toFixed(1)} dB</dd>
          <dt>Receiver sensitivity</dt><dd>{gatewaySensitivity.toFixed(1)} dBm</dd>
          <dt>Fade margin target</dt><dd>{terrain.relayB.fade.toFixed(1)} dB</dd>
          <dt>Obstruction / clutter loss</dt><dd>{terrain.relayB.clutter.toFixed(1)} dB</dd>
          <dt>Misc. implementation loss</dt><dd>{(terrain.relayB.misc - gatewayPreset.miscBonus).toFixed(1)} dB</dd>
          <dt>Reference path loss</dt><dd>{terrain.relayB.refPathLoss.toFixed(1)} dB</dd>
          <dt>Allowed path loss</dt><dd>{pathLossB.toFixed(1)} dB</dd>
        </dl>
      </div>
    </>
  )
}
