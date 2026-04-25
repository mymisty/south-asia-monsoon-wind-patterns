const { monsoonConfig } = require('../../data/monsoon.js')

function n(value, size) {
  return value * size
}

function setFill(ctx, color) {
  ctx.setFillStyle(color)
}

function setStroke(ctx, color, width) {
  ctx.setStrokeStyle(color)
  ctx.setLineWidth(width)
}

function drawPolygon(ctx, points, width, height, fill, stroke) {
  ctx.beginPath()
  points.forEach((point, index) => {
    const x = n(point[0], width)
    const y = n(point[1], height)
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.closePath()
  setFill(ctx, fill)
  ctx.fill()
  if (stroke) {
    setStroke(ctx, stroke, 1)
    ctx.stroke()
  }
}

function drawLabel(ctx, text, x, y, color, size, align) {
  ctx.setFontSize(size)
  ctx.setTextAlign(align || 'center')
  ctx.setTextBaseline('middle')
  setFill(ctx, color)
  ctx.fillText(text, x, y)
}

function drawArrowHead(ctx, x, y, angle, color, size) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x - Math.cos(angle - Math.PI / 6) * size, y - Math.sin(angle - Math.PI / 6) * size)
  ctx.lineTo(x - Math.cos(angle + Math.PI / 6) * size, y - Math.sin(angle + Math.PI / 6) * size)
  ctx.closePath()
  setFill(ctx, color)
  ctx.fill()
}

function drawArrow(ctx, width, height, start, end, color, label) {
  const x1 = n(start[0], width)
  const y1 = n(start[1], height)
  const x2 = n(end[0], width)
  const y2 = n(end[1], height)
  const angle = Math.atan2(y2 - y1, x2 - x1)

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.setLineCap('round')
  setStroke(ctx, color, 5)
  ctx.stroke()
  drawArrowHead(ctx, x2, y2, angle, color, Math.max(13, width * 0.028))

  if (label) {
    drawLabel(ctx, label, (x1 + x2) / 2, (y1 + y2) / 2 - 14, color, 13, 'center')
  }
}

function drawCurvedArrow(ctx, width, height, start, control, end, color, label) {
  const x1 = n(start[0], width)
  const y1 = n(start[1], height)
  const cx = n(control[0], width)
  const cy = n(control[1], height)
  const x2 = n(end[0], width)
  const y2 = n(end[1], height)
  const angle = Math.atan2(y2 - cy, x2 - cx)

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.quadraticCurveTo(cx, cy, x2, y2)
  ctx.setLineCap('round')
  setStroke(ctx, color, 4)
  ctx.stroke()
  drawArrowHead(ctx, x2, y2, angle, color, Math.max(12, width * 0.026))
  drawLabel(ctx, label, n(0.36, width), n(0.72, height), color, 12, 'center')
}

function drawPressure(ctx, width, height, x, y, type, caption) {
  const cx = n(x, width)
  const cy = n(y, height)
  const isHigh = type === 'H'
  const color = isHigh ? '#c75b3a' : '#2d76b6'
  const bg = isHigh ? 'rgba(255, 238, 224, 0.95)' : 'rgba(226, 243, 255, 0.95)'

  ctx.beginPath()
  ctx.arc(cx, cy, 20, 0, Math.PI * 2)
  setFill(ctx, bg)
  ctx.fill()
  setStroke(ctx, color, 2)
  ctx.stroke()
  drawLabel(ctx, type, cx, cy - 1, color, 24, 'center')
  drawLabel(ctx, caption, cx, cy + 34, color, 12, 'center')
}

function drawRain(ctx, width, height, season) {
  if (season === 'summer') {
    ctx.setGlobalAlpha(0.28)
    drawPolygon(ctx, [
      [0.52, 0.31],
      [0.78, 0.35],
      [0.84, 0.52],
      [0.68, 0.66],
      [0.50, 0.58]
    ], width, height, '#248bd4', null)
    drawPolygon(ctx, [
      [0.31, 0.47],
      [0.43, 0.58],
      [0.39, 0.72],
      [0.28, 0.63]
    ], width, height, '#248bd4', null)
    ctx.setGlobalAlpha(1)

    for (let i = 0; i < 11; i += 1) {
      const x = n(0.55 + (i % 6) * 0.045, width)
      const y = n(0.42 + Math.floor(i / 6) * 0.12, height)
      setStroke(ctx, '#1d80c1', 2)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 6, y + 14)
      ctx.stroke()
    }
    drawLabel(ctx, '迎风坡降水增强', n(0.72, width), n(0.59, height), '#1b6f9e', 13, 'center')
  } else {
    ctx.setGlobalAlpha(0.18)
    drawPolygon(ctx, [
      [0.42, 0.40],
      [0.71, 0.42],
      [0.73, 0.68],
      [0.42, 0.72],
      [0.30, 0.58]
    ], width, height, '#b98254', null)
    ctx.setGlobalAlpha(1)
    drawLabel(ctx, '干燥少雨', n(0.64, width), n(0.61, height), '#9b623f', 14, 'center')
  }
}

function drawTerrain(ctx, width, height) {
  const peaks = [
    [0.33, 0.30],
    [0.40, 0.20],
    [0.47, 0.31],
    [0.54, 0.19],
    [0.61, 0.32],
    [0.69, 0.22],
    [0.77, 0.33]
  ]
  ctx.beginPath()
  peaks.forEach((point, index) => {
    const x = n(point[0], width)
    const y = n(point[1], height)
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.lineTo(n(0.79, width), n(0.37, height))
  ctx.lineTo(n(0.31, width), n(0.36, height))
  ctx.closePath()
  setFill(ctx, '#95836e')
  ctx.fill()
  setStroke(ctx, '#ffffff', 2)
  ctx.stroke()
  drawLabel(ctx, '喜马拉雅山脉', n(0.58, width), n(0.27, height), '#5c493a', 13, 'center')
}

function drawBaseMap(ctx, width, height, season) {
  const oceanColor = season === 'summer' ? '#bfe9f1' : '#d2e9f1'
  const landColor = season === 'summer' ? '#ead09e' : '#e3d6c2'
  const mainlandColor = season === 'summer' ? '#e9c487' : '#d9cdbd'

  setFill(ctx, oceanColor)
  ctx.fillRect(0, 0, width, height)

  ctx.setGlobalAlpha(0.32)
  setStroke(ctx, '#6bb6ca', 1)
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath()
    ctx.arc(n(0.18 + i * 0.11, width), n(0.74, height), 34 + i * 3, 0.2, 2.85)
    ctx.stroke()
  }
  ctx.setGlobalAlpha(1)

  drawPolygon(ctx, [
    [0.08, 0.11],
    [0.25, 0.05],
    [0.55, 0.04],
    [0.90, 0.11],
    [0.91, 0.35],
    [0.75, 0.40],
    [0.62, 0.34],
    [0.48, 0.38],
    [0.31, 0.32],
    [0.14, 0.34]
  ], width, height, mainlandColor, '#c5b089')

  drawPolygon(ctx, [
    [0.37, 0.34],
    [0.50, 0.36],
    [0.63, 0.44],
    [0.61, 0.62],
    [0.54, 0.82],
    [0.45, 0.70],
    [0.37, 0.56],
    [0.30, 0.43]
  ], width, height, landColor, '#bfa876')

  drawPolygon(ctx, [
    [0.63, 0.42],
    [0.76, 0.46],
    [0.76, 0.58],
    [0.66, 0.60]
  ], width, height, landColor, '#bfa876')

  ctx.beginPath()
  ctx.arc(n(0.56, width), n(0.84, height), 10, 0, Math.PI * 2)
  setFill(ctx, '#dcc59b')
  ctx.fill()

  setStroke(ctx, 'rgba(39, 83, 101, 0.2)', 1)
  ctx.beginPath()
  ctx.moveTo(0, n(0.82, height))
  ctx.lineTo(width, n(0.82, height))
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, n(0.42, height))
  ctx.lineTo(width, n(0.42, height))
  ctx.stroke()

  drawLabel(ctx, '阿拉伯海', n(0.19, width), n(0.64, height), '#327da0', 12, 'center')
  drawLabel(ctx, '孟加拉湾', n(0.73, width), n(0.67, height), '#327da0', 12, 'center')
  drawLabel(ctx, '印度洋', n(0.45, width), n(0.92, height), '#2d7696', 13, 'center')
  drawLabel(ctx, '印度半岛', n(0.48, width), n(0.54, height), '#6b5a3d', 12, 'center')
  drawLabel(ctx, '北回归线', n(0.12, width), n(0.40, height), '#62747c', 11, 'center')
  drawLabel(ctx, '赤道', n(0.08, width), n(0.80, height), '#62747c', 11, 'center')
}

Page({
  data: {
    season: 'winter',
    showTerrain: true,
    showRainfall: true,
    showWindBelt: false,
    showExplain: true,
    canvasWidth: 343,
    canvasHeight: 193,
    config: monsoonConfig.winter,
    impactCards: monsoonConfig.winter.impactCards
  },

  onReady() {
    this.resizeCanvas()
  },

  onShow() {
    this.drawModel()
  },

  onResize() {
    this.resizeCanvas()
  },

  resizeCanvas() {
    const info = wx.getSystemInfoSync()
    const width = Math.min(info.windowWidth - 32, 720)
    const height = Math.round(width * 9 / 16)
    this.setData({
      canvasWidth: width,
      canvasHeight: height
    }, () => this.drawModel())
  },

  setSeason(event) {
    const season = event.currentTarget.dataset.season
    if (!season || season === this.data.season) {
      return
    }
    const config = monsoonConfig[season]
    this.setData({
      season,
      config,
      impactCards: config.impactCards
    }, () => this.drawModel())
  },

  toggleLayer(event) {
    const key = event.currentTarget.dataset.key
    this.setData({
      [key]: event.detail.value
    }, () => this.drawModel())
  },

  toggleExplain() {
    this.setData({
      showExplain: !this.data.showExplain
    })
  },

  goCompare() {
    wx.navigateTo({
      url: '/pages/compare/compare'
    })
  },

  goQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    })
  },

  drawModel() {
    if (!this.data.canvasWidth || !this.data.canvasHeight) {
      return
    }

    const ctx = wx.createCanvasContext('monsoonCanvas', this)
    const width = this.data.canvasWidth
    const height = this.data.canvasHeight
    const season = this.data.season
    const config = this.data.config

    ctx.clearRect(0, 0, width, height)
    drawBaseMap(ctx, width, height, season)

    if (this.data.showRainfall) {
      drawRain(ctx, width, height, season)
    }

    if (this.data.showTerrain) {
      drawTerrain(ctx, width, height)
    }

    if (season === 'winter') {
      drawPressure(ctx, width, height, 0.66, 0.25, config.landPressure, '大陆冷高压')
      drawPressure(ctx, width, height, 0.35, 0.72, config.oceanPressure, '海洋相对低压')
      drawArrow(ctx, width, height, [0.72, 0.28], [0.45, 0.62], '#376da4', '东北季风')
      drawArrow(ctx, width, height, [0.61, 0.30], [0.28, 0.69], '#376da4', '')
      drawArrow(ctx, width, height, [0.80, 0.36], [0.61, 0.76], '#376da4', '')
    } else {
      drawPressure(ctx, width, height, 0.63, 0.25, config.landPressure, '大陆热低压')
      drawPressure(ctx, width, height, 0.30, 0.76, config.oceanPressure, '海洋相对高压')
      drawArrow(ctx, width, height, [0.17, 0.80], [0.43, 0.47], '#df6a3f', '西南季风')
      drawArrow(ctx, width, height, [0.43, 0.86], [0.64, 0.47], '#df6a3f', '')
      drawArrow(ctx, width, height, [0.22, 0.66], [0.58, 0.34], '#df6a3f', '')
      if (this.data.showWindBelt) {
        drawCurvedArrow(ctx, width, height, [0.84, 0.91], [0.55, 0.87], [0.40, 0.62], '#9a5ab8', '东南信风越赤道右偏')
      }
    }

    drawLabel(ctx, config.windFeature, n(0.83, width), n(0.12, height), season === 'summer' ? '#ba5937' : '#376da4', 15, 'center')
    ctx.draw(false)
  }
})
