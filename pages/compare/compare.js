const { compareRows } = require('../../data/monsoon.js')

function backToModel() {
  const pages = getCurrentPages()

  for (let index = pages.length - 2; index >= 0; index -= 1) {
    if (pages[index].route === 'pages/model/model') {
      wx.navigateBack({
        delta: pages.length - 1 - index
      })
      return
    }
  }

  wx.redirectTo({
    url: '/pages/model/model'
  })
}

Page({
  data: {
    rows: compareRows
  },

  goModel() {
    backToModel()
  },

  goQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    })
  }
})
