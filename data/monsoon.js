const monsoonConfig = {
  winter: {
    label: '冬季 / 1月',
    landPressure: 'H',
    oceanPressure: 'L',
    windName: '东北季风',
    windFeature: '干燥少雨',
    landThermal: '大陆降温快',
    oceanThermal: '海洋相对较暖',
    rainfallLevel: '少雨，形成旱季',
    agriculture: '利于小麦等旱季作物管理，但水源不足地区易受旱情影响。',
    disaster: '降水少，需关注干旱和灌溉压力。',
    logic: [
      '亚洲大陆降温快，形成冷高压。',
      '气流由亚洲内陆一侧吹向印度洋。',
      '形成东北季风，南亚大部分地区干燥少雨。'
    ],
    impactCards: [
      {
        title: '农业节奏',
        text: '降水偏少，灌溉条件会影响旱季作物产量。'
      },
      {
        title: '灾害提示',
        text: '部分地区可能出现季节性干旱和水资源紧张。'
      }
    ]
  },
  summer: {
    label: '夏季 / 7月',
    landPressure: 'L',
    oceanPressure: 'H',
    windName: '西南季风',
    windFeature: '暖湿多雨',
    landThermal: '大陆升温快',
    oceanThermal: '海洋相对较冷',
    rainfallLevel: '多雨，形成雨季',
    agriculture: '水热配合好，利于水稻、黄麻等作物生长。',
    disaster: '季风强或持续时间长时，易诱发洪涝和滑坡。',
    logic: [
      '亚洲大陆升温快，形成热低压。',
      '印度洋暖湿气流吹向陆地。',
      '南半球东南信风越过赤道后右偏，成为西南季风的重要来源。',
      '水汽受喜马拉雅山抬升，南亚降水增多。'
    ],
    impactCards: [
      {
        title: '农业节奏',
        text: '雨热同期，是南亚主要农作物生长的重要水源。'
      },
      {
        title: '灾害提示',
        text: '降水过强会增加洪涝、城市内涝和山地滑坡风险。'
      }
    ]
  }
}

const compareRows = [
  { id: 'season', label: '季节', winter: '冬季', summer: '夏季' },
  { id: 'pressure', label: '气压', winter: '大陆高压，海洋相对低压', summer: '大陆低压，海洋相对高压' },
  { id: 'wind', label: '风向', winter: '东北季风', summer: '西南季风' },
  { id: 'source', label: '来源', winter: '亚洲内陆', summer: '印度洋' },
  { id: 'feature', label: '性质', winter: '干燥', summer: '暖湿' },
  { id: 'rainfall', label: '降水', winter: '少雨，形成旱季', summer: '多雨，形成雨季' },
  { id: 'impact', label: '影响', winter: '灌溉压力、旱情风险', summer: '作物生长旺盛，洪涝风险上升' }
]

const regionFeatures = [
  { name: '印度半岛', x: 49, y: 53, type: 'land' },
  { name: '阿拉伯海', x: 22, y: 59, type: 'water' },
  { name: '孟加拉湾', x: 66, y: 62, type: 'water' },
  { name: '印度洋', x: 43, y: 82, type: 'water' },
  { name: '喜马拉雅山脉', x: 55, y: 27, type: 'mountain' },
  { name: '赤道', x: 12, y: 82, type: 'line' },
  { name: '北回归线', x: 10, y: 41, type: 'line' }
]

module.exports = {
  monsoonConfig,
  compareRows,
  regionFeatures
}
