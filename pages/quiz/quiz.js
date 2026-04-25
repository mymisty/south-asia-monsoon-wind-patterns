const { questions } = require('../../data/quiz.js')

function createEmptyAnswers() {
  return questions.map(() => -1)
}

Page({
  data: {
    questions,
    selectedList: createEmptyAnswers(),
    submitted: false,
    score: 0
  },

  chooseOption(event) {
    if (this.data.submitted) {
      return
    }
    const questionIndex = Number(event.currentTarget.dataset.question)
    const optionIndex = Number(event.currentTarget.dataset.option)
    const selectedList = this.data.selectedList.slice()
    selectedList[questionIndex] = optionIndex
    this.setData({
      selectedList
    })
  },

  submitQuiz() {
    const unanswered = this.data.selectedList.some((item) => item < 0)
    if (unanswered) {
      wx.showToast({
        title: '请先完成全部题目',
        icon: 'none'
      })
      return
    }

    const score = this.data.questions.reduce((total, question, index) => {
      return total + (question.answerIndex === this.data.selectedList[index] ? 1 : 0)
    }, 0)

    this.setData({
      submitted: true,
      score
    })
  },

  resetQuiz() {
    this.setData({
      selectedList: createEmptyAnswers(),
      submitted: false,
      score: 0
    })
  },

  goModel() {
    wx.navigateTo({
      url: '/pages/model/model'
    })
  }
})
