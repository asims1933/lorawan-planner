import { formatDistance, radioHorizonKm } from './lorawan.js'

function drawRangeRings(ctx, cx, cy, radius, fill, stroke) {
  for (let i = 1; i <= 3; i++) {
    const r = radius * (i / 3)
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.3
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
  ctx.font = '700 15px Inter, sans-serif'
  ctx.fillText(l1, x - 22, y + 34)
  ctx.font = '500 13px Inter, sans-serif'
  ctx.fillText(l2, x - 16, y + 52)
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
    ctx.fillText(`${km} km`, x - 10, y - 14)
  }
}

export function drawMap(canvas, {
  terrain, designA, designB, totalReach, relayPlacement,
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

  const margin = 90, gatewayX = 180, gatewayY = h / 2 - 40

  // Anchor scale to the radio horizon so rings visibly expand/contract
  // as signal parameters change rather than auto-scaling to fill the canvas.
  const refHorizon = radioHorizonKm(gatewayHeight, deviceHeight)
  const maxVisualKm = Math.max(refHorizon * 1.15, totalReach * 1.18, 1)
  const pxPerKm = (w - margin * 2) / maxVisualKm

  // Relay sits at relayPlacement% of total path; device at full total reach.
  const relayX = Math.min(w - margin - 60, gatewayX + (relayPlacement / 100) * totalReach * pxPerKm)
  const relayY = h / 2 + 80
  const deviceX = Math.min(w - margin - 20, gatewayX + totalReach * pxPerKm)
  const deviceY = h / 2 - 10

  if (useRelay) {
    drawRangeRings(ctx, gatewayX, gatewayY, designB * pxPerKm, 'rgba(120,211,255,0.14)', 'rgba(120,211,255,0.36)')
    drawRangeRings(ctx, relayX, relayY, designA * pxPerKm, 'rgba(158,255,181,0.14)', 'rgba(158,255,181,0.34)')
  } else {
    drawRangeRings(ctx, gatewayX, gatewayY, designA * pxPerKm, 'rgba(120,211,255,0.14)', 'rgba(120,211,255,0.36)')
  }

  ctx.setLineDash([12, 10])
  ctx.strokeStyle = 'rgba(255,213,106,0.9)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(gatewayX, gatewayY)
  if (useRelay) ctx.lineTo(relayX, relayY)
  ctx.lineTo(deviceX, deviceY)
  ctx.stroke()
  ctx.setLineDash([])

  drawNode(ctx, gatewayX, gatewayY, 18, '#78d3ff', `Gateway\n${Math.round(gatewayHeight)}m`)
  if (useRelay) drawNode(ctx, relayX, relayY, 14, '#9effb5', `Relay\n${Math.round(relayHeight)}m`)
  drawNode(ctx, deviceX, deviceY, 10, '#ffd56a', `Device\n${deviceHeight.toFixed(1)}m`)

  ctx.fillStyle = 'rgba(233,241,251,0.95)'
  ctx.font = '600 16px Inter, sans-serif'
  if (useRelay) {
    ctx.fillText(`Leg B: ${formatDistance(designB)}`, gatewayX + 24, gatewayY - 24)
    ctx.fillText(`Leg A: ${formatDistance(designA)}`, relayX + 20, relayY - 18)
  } else {
    ctx.fillText(`Direct: ${formatDistance(designA)}`, gatewayX + 24, gatewayY - 24)
  }

  ctx.font = '700 18px Inter, sans-serif'
  ctx.fillStyle = 'rgba(233,241,251,0.95)'
  ctx.fillText(`Estimated total: ${formatDistance(totalReach)}`, 28, 36)
  ctx.font = '600 15px Inter, sans-serif'
  ctx.fillStyle = limitingLeg === 'Leg A' ? '#9effb5' : '#78d3ff'
  ctx.fillText(`${limitingLeg} is limiting`, 28, 62)

  drawScale(ctx, w, h, maxVisualKm, pxPerKm)
}
