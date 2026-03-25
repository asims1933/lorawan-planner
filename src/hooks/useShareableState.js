import { useReducer, useEffect } from 'react'
import { presets } from '../lib/lorawan.js'

const SEP = '~'

const STATE_KEYS = [
  'region', 'gateway', 'terrain', 'useRelay',
  'gatewayHeight', 'relayHeight', 'deviceHeight', 'relayPlacement',
  'gatewayTx', 'deviceTx', 'relayTx',
  'gatewayGain', 'relayGain',
  'gatewaySensitivity', 'relaySensitivity',
]

export function encodeState(state) {
  return STATE_KEYS.map(k =>
    k === 'useRelay' ? (state[k] ? '1' : '0') : state[k]
  ).join(SEP)
}

function decodeState(str) {
  const parts = str.split(SEP)
  if (parts.length !== STATE_KEYS.length) return null
  const out = {}
  for (let i = 0; i < STATE_KEYS.length; i++) {
    const key = STATE_KEYS[i]
    const v = parts[i]
    if (key === 'region') {
      if (!presets.region[v]) return null
      out[key] = v
    } else if (key === 'gateway') {
      if (!presets.gateway[v]) return null
      out[key] = v
    } else if (key === 'terrain') {
      if (!presets.terrain[v]) return null
      out[key] = v
    } else if (key === 'useRelay') {
      out[key] = v === '1'
    } else {
      const num = parseFloat(v)
      if (isNaN(num)) return null
      out[key] = num
    }
  }
  return out
}

export function useShareableState(reducer, initialStateFn) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('s')
    if (s) {
      const decoded = decodeState(s)
      if (decoded) return { ...initialStateFn(), ...decoded }
    }
    return initialStateFn()
  })

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('s', encodeState(state))
    window.history.replaceState(null, '', url.toString())
  }, [state])

  return [state, dispatch]
}
