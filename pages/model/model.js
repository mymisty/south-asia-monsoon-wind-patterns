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

const WIND_ANIMATION_INTERVAL = 33
const WIND_ANIMATION_MAX_DELTA = 50

// Arrow language:
// - Fluent-like simple geometric arrowheads (clean, high contrast).
// - NASA-style vector field repetition: multiple small arrows flowing along one path.
const WIND_ARROW_STYLES = {
  winterMain: {
    color: '#376da4',
    lineWidth: 5.4,
    alpha: 0.9,
    markers: 4,
    speed: 0.00145,
    markerLength: 12,
    markerHead: 6,
    labelSize: 13
  },
  winterSecondary: {
    color: '#376da4',
    lineWidth: 3.4,
    alpha: 0.54,
    markers: 3,
    speed: 0.0011,
    markerLength: 9,
    markerHead: 4.8,
    labelSize: 11
  },
  summerMain: {
    color: '#df6a3f',
    lineWidth: 5.8,
    alpha: 0.92,
    markers: 5,
    speed: 0.00175,
    markerLength: 12.5,
    markerHead: 6.2,
    labelSize: 13
  },
  summerSecondary: {
    color: '#df6a3f',
    lineWidth: 3.5,
    alpha: 0.58,
    markers: 3,
    speed: 0.00125,
    markerLength: 9.5,
    markerHead: 5,
    labelSize: 11
  },
  windBelt: {
    color: '#9a5ab8',
    lineWidth: 3.6,
    alpha: 0.62,
    markers: 4,
    speed: 0.0013,
    markerLength: 10,
    markerHead: 5.2,
    labelSize: 11
  }
}

const SEASON_WIND_PATHS = {
  winter: [
    {
      role: 'main',
      label: '东北季风',
      labelPoint: [0.47, 0.52],
      labelAlign: 'right',
      start: [0.75, 0.26],
      control: [0.66, 0.36],
      end: [0.48, 0.58],
      offset: 0.08
    },
    {
      role: 'secondary',
      start: [0.62, 0.30],
      control: [0.48, 0.42],
      end: [0.30, 0.66],
      offset: 0.38
    },
    {
      role: 'secondary',
      start: [0.83, 0.37],
      control: [0.75, 0.48],
      end: [0.62, 0.73],
      offset: 0.62
    }
  ],
  summer: [
    {
      role: 'main',
      label: '西南季风',
      labelPoint: [0.34, 0.50],
      labelAlign: 'left',
      start: [0.16, 0.82],
      control: [0.27, 0.62],
      end: [0.45, 0.46],
      offset: 0.04
    },
    {
      role: 'secondary',
      label: '阿拉伯海分支',
      labelPoint: [0.57, 0.55],
      labelAlign: 'left',
      start: [0.42, 0.86],
      control: [0.54, 0.68],
      end: [0.66, 0.46],
      offset: 0.31
    },
    {
      role: 'secondary',
      label: '孟加拉湾分支',
      labelPoint: [0.59, 0.33],
      labelAlign: 'left',
      start: [0.22, 0.66],
      control: [0.40, 0.48],
      end: [0.61, 0.33],
      offset: 0.56
    }
  ]
}

const WIND_BELT_PATH = {
  label: '东南信风越赤道右偏',
  labelPoint: [0.28, 0.72],
  labelAlign: 'left',
  start: [0.84, 0.91],
  control: [0.56, 0.86],
  end: [0.40, 0.62],
  offset: 0.16
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

function drawSoftPolygon(ctx, points, width, height, fill, alpha) {
  ctx.setGlobalAlpha(alpha)
  drawPolygon(ctx, points, width, height, fill, null)
  ctx.setGlobalAlpha(alpha * 0.58)
  drawPolygon(ctx, points.map(([x, y]) => [x + (0.5 - x) * 0.018, y + (0.5 - y) * 0.018]), width, height, fill, null)
  ctx.setGlobalAlpha(1)
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

function quadraticPoint(start, control, end, t) {
  const one = 1 - t
  return {
    x: one * one * start.x + 2 * one * t * control.x + t * t * end.x,
    y: one * one * start.y + 2 * one * t * control.y + t * t * end.y
  }
}

function pathPoint(point, width, height) {
  return {
    x: n(point[0], width),
    y: n(point[1], height)
  }
}

function drawLabelTag(ctx, text, x, y, color, size, align) {
  const paddingX = 8
  const paddingY = 5
  const tagWidth = text.length * size * 0.9 + paddingX * 2
  const tagHeight = size + paddingY * 2
  const left = align === 'right' ? x - tagWidth : align === 'center' ? x - tagWidth / 2 : x

  ctx.setGlobalAlpha(0.72)
  setFill(ctx, '#ffffff')
  ctx.fillRect(left, y - tagHeight / 2, tagWidth, tagHeight)
  ctx.setGlobalAlpha(1)
  drawLabel(ctx, text, left + (align === 'right' ? tagWidth - paddingX : paddingX), y, color, size, align === 'right' ? 'right' : 'left')
}

function drawWindArrow(ctx, width, height, path, style, time) {
  const start = pathPoint(path.start, width, height)
  const control = pathPoint(path.control, width, height)
  const end = pathPoint(path.end, width, height)
  const endTangent = quadraticPoint(start, control, end, 0.97)
  const angle = Math.atan2(end.y - endTangent.y, end.x - endTangent.x)
  const lineWidth = style.lineWidth

  ctx.setLineCap('round')
  if (ctx.setLineJoin) {
    ctx.setLineJoin('round')
  }

  ctx.setGlobalAlpha(style.alpha * 0.18)
  setStroke(ctx, style.color, lineWidth + 4)
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
  ctx.stroke()

  ctx.setGlobalAlpha(style.alpha)
  setStroke(ctx, style.color, lineWidth)
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
  ctx.stroke()

  const phase = ((time || 0) * style.speed + (path.offset || 0)) % 1
  const markers = style.markers || 3
  for (let i = 0; i < markers; i += 1) {
    const t = (phase + i / markers) % 1
    const point = quadraticPoint(start, control, end, t)
    const prev = quadraticPoint(start, control, end, Math.max(0, t - 0.02))
    const markerAngle = Math.atan2(point.y - prev.y, point.x - prev.x)
    const markerLength = style.markerLength || Math.max(8, lineWidth * 2.1)
    const markerHead = style.markerHead || Math.max(4.2, lineWidth * 1.1)
    const fade = Math.sin(Math.PI * t)

    ctx.setGlobalAlpha((0.14 + 0.8 * fade * fade) * style.alpha)
    setStroke(ctx, style.color, Math.max(1.1, lineWidth * 0.42))
    ctx.beginPath()
    ctx.moveTo(
      point.x - Math.cos(markerAngle) * markerLength,
      point.y - Math.sin(markerAngle) * markerLength
    )
    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    drawArrowHead(ctx, point.x, point.y, markerAngle, style.color, markerHead)
  }

  ctx.setGlobalAlpha(1)
  drawArrowHead(ctx, end.x, end.y, angle, style.color, Math.max(8, lineWidth * 2.15))

  if (path.label) {
    const labelPoint = pathPoint(path.labelPoint, width, height)
    drawLabelTag(ctx, path.label, labelPoint.x, labelPoint.y, style.color, style.labelSize, path.labelAlign || 'left')
  }
}

function drawWindLayer(ctx, width, height, season, time) {
  const paths = SEASON_WIND_PATHS[season]
  const stylePrefix = season === 'summer' ? 'summer' : 'winter'

  paths
    .filter((path) => path.role !== 'main')
    .forEach((path) => drawWindArrow(ctx, width, height, path, WIND_ARROW_STYLES[`${stylePrefix}Secondary`], time))

  paths
    .filter((path) => path.role === 'main')
    .forEach((path) => drawWindArrow(ctx, width, height, path, WIND_ARROW_STYLES[`${stylePrefix}Main`], time))
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
    [
      { fill: '#9ed7f2', alpha: 0.16, points: [[0.28, 0.34], [0.78, 0.34], [0.88, 0.53], [0.72, 0.72], [0.37, 0.68], [0.24, 0.52]] },
      { fill: '#2c93d8', alpha: 0.24, points: [[0.52, 0.31], [0.78, 0.35], [0.84, 0.52], [0.68, 0.66], [0.50, 0.58]] },
      { fill: '#2c93d8', alpha: 0.23, points: [[0.31, 0.47], [0.43, 0.58], [0.39, 0.72], [0.28, 0.63]] },
      { fill: '#0f5fa9', alpha: 0.31, points: [[0.60, 0.38], [0.82, 0.42], [0.78, 0.57], [0.62, 0.60]] },
      { fill: '#0f5fa9', alpha: 0.28, points: [[0.34, 0.50], [0.43, 0.58], [0.39, 0.67], [0.31, 0.62]] }
    ].forEach((band) => drawSoftPolygon(ctx, band.points, width, height, band.fill, band.alpha))

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
    [
      { fill: '#e3c49f', alpha: 0.13, points: [[0.31, 0.36], [0.76, 0.39], [0.79, 0.68], [0.43, 0.76], [0.26, 0.58]] },
      { fill: '#c08455', alpha: 0.17, points: [[0.42, 0.40], [0.71, 0.42], [0.73, 0.68], [0.42, 0.72], [0.30, 0.58]] },
      { fill: '#9f613d', alpha: 0.14, points: [[0.47, 0.48], [0.66, 0.49], [0.67, 0.62], [0.50, 0.66], [0.39, 0.57]] }
    ].forEach((band) => drawSoftPolygon(ctx, band.points, width, height, band.fill, band.alpha))
    ctx.setGlobalAlpha(0.26)
    setStroke(ctx, '#8f5a39', 1)
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath()
      ctx.moveTo(n(0.34 + i * 0.055, width), n(0.44, height))
      ctx.lineTo(n(0.43 + i * 0.055, width), n(0.68, height))
      ctx.stroke()
    }
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

function getWindBeltMeta(season) {
  const windBeltAvailable = season === 'summer'
  return {
    windBeltAvailable,
    windBeltDesc: windBeltAvailable ? '夏季东南信风越赤道右偏' : '仅夏季显示：冬季不绘制风带移动'
  }
}

function drawLegend(ctx, width, height, season) {
  const isSummer = season === 'summer'
  const panelWidth = Math.min(176, width * 0.52)
  const panelHeight = 90
  const x = width - panelWidth - 10
  const y = 10
  const windColor = isSummer ? '#df6a3f' : '#376da4'

  ctx.setGlobalAlpha(0.88)
  setFill(ctx, '#ffffff')
  ctx.fillRect(x, y, panelWidth, panelHeight)
  ctx.setGlobalAlpha(1)
  setStroke(ctx, 'rgba(34, 72, 94, 0.14)', 1)
  ctx.beginPath()
  ctx.rect(x, y, panelWidth, panelHeight)
  ctx.stroke()

  drawLabel(ctx, isSummer ? '夏季图例 · 暖湿' : '冬季图例 · 干燥', x + 12, y + 14, '#17364b', 11, 'left')

  const windY = y + 36
  setStroke(ctx, windColor, 4)
  ctx.setLineCap('round')
  ctx.beginPath()
  ctx.moveTo(x + 14, windY)
  ctx.lineTo(x + 48, windY)
  ctx.stroke()
  drawArrowHead(ctx, x + 48, windY, 0, windColor, 9)
  drawLabel(ctx, isSummer ? '西南季风' : '东北季风', x + 62, windY, '#314d5d', 10, 'left')

  const rainY = y + 58
  setFill(ctx, isSummer ? '#9ed7f2' : '#e3c49f')
  ctx.fillRect(x + 14, rainY - 6, 14, 12)
  setFill(ctx, isSummer ? '#2c93d8' : '#c08455')
  ctx.fillRect(x + 28, rainY - 6, 14, 12)
  setFill(ctx, isSummer ? '#0f5fa9' : '#9f613d')
  ctx.fillRect(x + 42, rainY - 6, 14, 12)
  drawLabel(ctx, isSummer ? '降水弱→强' : '干旱弱→强', x + 62, rainY, '#314d5d', 10, 'left')

  const pressureY = y + 78
  ;[['H', '#c75b3a'], ['L', '#2d76b6']].forEach(([type, color], index) => {
    const cx = x + 22 + index * 24
    ctx.beginPath()
    ctx.arc(cx, pressureY, 7, 0, Math.PI * 2)
    setFill(ctx, type === 'H' ? '#ffece0' : '#e2f3ff')
    ctx.fill()
    setStroke(ctx, color, 1)
    ctx.stroke()
    drawLabel(ctx, type, cx, pressureY, color, 9, 'center')
  })
  drawLabel(ctx, '高压 / 低压', x + 62, pressureY, '#314d5d', 10, 'left')
}

Page({
  data: {
    season: 'winter',
    showTerrain: true,
    showRainfall: true,
    showWindBelt: false,
    windBeltAvailable: false,
    windBeltDesc: '仅夏季显示：冬季不绘制风带移动',
    showExplain: true,
    canvasWidth: 343,
    canvasHeight: 193,
    canvasPixelWidth: 343,
    canvasPixelHeight: 193,
    pixelRatio: 1,
    config: monsoonConfig.winter,
    impactCards: monsoonConfig.winter.impactCards
  },

  onReady() {
    this.resizeCanvas()
  },

  onShow() {
    this.startWindAnimation()
    this.drawModel()
  },

  onHide() {
    this.stopWindAnimation()
  },

  onUnload() {
    this.stopWindAnimation()
  },

  onResize() {
    this.resizeCanvas()
  },

  startWindAnimation() {
    this.stopWindAnimation()
    this.flowTime = 0
    this.lastFlowTick = Date.now()
    this.windAnimationTimer = setInterval(() => {
      const now = Date.now()
      const delta = Math.min(now - this.lastFlowTick, WIND_ANIMATION_MAX_DELTA)
      this.lastFlowTick = now
      this.flowTime += delta
      this.drawModel()
    }, WIND_ANIMATION_INTERVAL)
  },

  stopWindAnimation() {
    if (this.windAnimationTimer) {
      clearInterval(this.windAnimationTimer)
      this.windAnimationTimer = null
    }
    this.lastFlowTick = null
  },

  resizeCanvas() {
    const info = wx.getSystemInfoSync()
    const width = Math.min(info.windowWidth - 32, 720)
    const height = Math.round(width * 9 / 16)
    const pixelRatio = Math.min(info.pixelRatio || 1, 3)
    this.setData({
      canvasWidth: width,
      canvasHeight: height,
      canvasPixelWidth: Math.round(width * pixelRatio),
      canvasPixelHeight: Math.round(height * pixelRatio),
      pixelRatio
    }, () => this.drawModel())
  },

  setSeason(event) {
    const season = event.currentTarget.dataset.season
    if (!season || season === this.data.season) {
      return
    }
    const config = monsoonConfig[season]
    const windBeltMeta = getWindBeltMeta(season)
    this.setData({
      season,
      config,
      impactCards: config.impactCards,
      windBeltAvailable: windBeltMeta.windBeltAvailable,
      windBeltDesc: windBeltMeta.windBeltDesc
    }, () => this.drawModel())
  },

  toggleLayer(event) {
    const key = event.currentTarget.dataset.key
    if (key === 'showWindBelt' && !this.data.windBeltAvailable) {
      wx.showToast({
        title: '风带移动仅夏季显示',
        icon: 'none'
      })
      return
    }
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
    const pixelRatio = this.data.pixelRatio || 1
    const season = this.data.season
    const config = this.data.config
    const time = this.flowTime || 0

    ctx.scale(pixelRatio, pixelRatio)
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
      drawWindLayer(ctx, width, height, season, time)
    } else {
      drawPressure(ctx, width, height, 0.63, 0.25, config.landPressure, '大陆热低压')
      drawPressure(ctx, width, height, 0.30, 0.76, config.oceanPressure, '海洋相对高压')
      drawWindLayer(ctx, width, height, season, time)
      if (this.data.showWindBelt) {
        drawWindArrow(ctx, width, height, WIND_BELT_PATH, WIND_ARROW_STYLES.windBelt, time)
      }
    }

    drawLabel(ctx, config.windFeature, n(0.62, width), n(0.13, height), season === 'summer' ? '#ba5937' : '#376da4', 15, 'center')
    drawLegend(ctx, width, height, season)
    ctx.draw(false)
  }
})
