const { regionFeatures } = require('../../data/monsoon.js')

Page({
  data: {
    features: regionFeatures
  },

  goModel() {
    wx.navigateTo({
      url: '/pages/model/model'
    })
  },

  goCompare() {
    wx.navigateTo({
      url: '/pages/compare/compare'
    })
  }
})
