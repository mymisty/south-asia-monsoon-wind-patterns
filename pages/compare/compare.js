const { compareRows } = require('../../data/monsoon.js')

Page({
  data: {
    rows: compareRows
  },

  goModel() {
    wx.navigateTo({
      url: '/pages/model/model'
    })
  },

  goQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    })
  }
})
