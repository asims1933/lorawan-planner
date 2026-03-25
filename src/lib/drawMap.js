import { formatDistance, radioHorizonKm } from './lorawan.js'

function drawRangeRings(ctx, cx, cy, radius, fill, stroke, strokeOuter) {
  for (let i = 1; i <= 3; i++) {
    const r = radius * (i / 3)
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = fill
    // Outermost ring gets a brighter border — this is where the next node sits
    ctx.strokeStyle = i === 3 ? strokeOuter : stroke
    ctx.lineWidth = i === 3 ? 2 : 1.2
    ctx.fill()
    ctx.stroke()
  }
}

function drawNode(ctx, x, y, radius, color, label) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 18
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 2
  ctx.stroke()
  const [l1, l2] = label.split('\n')
  ctx.fillStyle = '#f4f8fd'
  ctx.font = '700 14px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(l1, x, y + 34)
  ctx.font = '500 12px Inter, sans-serif'
  ctx.fillText(l2, x, y + 50)
  ctx.textAlign = 'left'
}

function drawTerrain(ctx) {
  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  for (let i = 0; i < 14; i++) {
    const x = 50 + i * 68
    const y = 510 + Math.sin(i * 0.75) * 18
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 20, y - 60)
    ctx.lineTo(x + 36, y)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function drawScale(ctx, w, h, maxVisualKm, pxPerKm) {
  const y = h - 42, x0 = 30, x1 = w - 30
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke()
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) / steps) * i
    ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke()
    const km = ((x - x0) / pxPerKm).toFixed(0)
    ctx.fillStyle = 'rgba(233,241,251,0.8)'
    ctx.font = '500 12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${km} km`, x, y - 14)
  }
  ctx.textAlign = 'left'
}

export function drawMap(canvas, {
  terrain, designA, designB, totalReach,
  gatewayHeight, relayHeight, deviceHeight, useRelay, limitingLeg,
}) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)

  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, terrain.bg)
  gradient.addColorStop(1, '#08111d')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
  drawTerrain(ctx)

  const margin = 90, gatewayX = 180
  // All nodes share the same Y — chain reads left-to-right
  const nodeY = h / 2 - 50

  // Horizon-anchored scale: rings expand/contract as signal params change
  const refHorizon = radioHorizonKm(gatewayHeight, deviceHeight)
  const maxVisualKm = Math.max(refHorizon * 1.15, totalReach * 1.18, 1)
  const pxPerKm = (w - margin * 2) / maxVisualKm

  // Chain positions:
  //   relay sits on the edge of the gateway's ring (at designB from gateway)
  //   device sits on the edge of the relay's ring (at designA from relay = totalReach from gateway)
  const relayX = Math.min(w - margin - 80, gatewayX + designB * pxPerKm)
  const deviceX = Math.min(w - margin - 20, gatewayX + totalReach * pxPerKm)

  // Rings — outer border brighter to show where the next node sits
  if (useRelay) {
    drawRangeRings(ctx, gatewayX, nodeY, designB * pxPerKm,
      'rgba(120,211,255,0.08)', 'rgba(120,211,255,0.22)', 'rgba(120,211,255,0.7)')
    drawRangeRings(ctx, relayX, nodeY, designA * pxPerKm,
      'rgba(158,255,181,0.08)', 'rgba(158,255,181,0.20)', 'rgba(158,255,181,0.65)')
  } else {
    drawRangeRings(ctx, gatewayX, nodeY, designA * pxPerKm,
      'rgba(120,211,255,0.10)', 'rgba(120,211,255,0.25)', 'rgba(120,211,255,0.7)')
  }

  // Dashed path line along the chain
  ctx.setLineDash([10, 8])
  ctx.strokeStyle = 'rgba(255,213,106,0.7)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(gatewayX, nodeY)
  if (useRelay) ctx.lineTo(relayX, nodeY)
  ctx.lineTo(deviceX, nodeY)
  ctx.stroke()
  ctx.setLineDash([])

  // Leg distance labels centered above each segment
  ctx.fillStyle = 'rgba(233,241,251,0.85)'
  ctx.font = '600 14px Inter, sans-serif'
  ctx.textAlign = 'center'
  if (useRelay) {
    ctx.fillText(`Leg B  ${formatDistance(designB)}`, (gatewayX + relayX) / 2, nodeY - 18)
    ctx.fillText(`Leg A  ${formatDistance(designA)}`, (relayX + deviceX) / 2, nodeY - 18)
  } else {
    ctx.fillText(`Direct  ${formatDistance(designA)}`, (gatewayX + deviceX) / 2, nodeY - 18)
  }
  ctx.textAlign = 'left'

  // Nodes (drawn after rings so they sit on top)
  drawNode(ctx, gatewayX, nodeY, 18, '#78d3ff', `Gateway\n${Math.round(gatewayHeight)}m`)
  if (useRelay) drawNode(ctx, relayX, nodeY, 14, '#9effb5', `Relay\n${Math.round(relayHeight)}m`)
  drawNode(ctx, deviceX, nodeY, 10, '#ffd56a', `Device\n${deviceHeight.toFixed(1)}m`)

  // Summary — top left
  ctx.font = '700 17px Inter, sans-serif'
  ctx.fillStyle = 'rgba(233,241,251,0.95)'
  ctx.fillText(`Estimated total: ${formatDistance(totalReach)}`, 28, 36)
  ctx.font = '600 14px Inter, sans-serif'
  ctx.fillStyle = limitingLeg === 'Leg A' ? '#9effb5' : '#78d3ff'
  ctx.fillText(`${limitingLeg} is limiting`, 28, 60)

  drawScale(ctx, w, h, maxVisualKm, pxPerKm)
}
