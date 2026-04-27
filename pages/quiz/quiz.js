const { questions } = require('../../data/quiz.js')

function createEmptyAnswers() {
  return questions.map(() => -1)
}

function optionLetter(index) {
  const base = 'A'.charCodeAt(0)
  let value = index
  let label = ''

  do {
    label = String.fromCharCode(base + (value % 26)) + label
    value = Math.floor(value / 26) - 1
  } while (value >= 0)

  return label
}

function decorateQuestions() {
  return questions.map((question) => {
    return Object.assign({}, question, {
      optionItems: question.options.map((text, index) => ({
        text,
        letter: optionLetter(index)
      }))
    })
  })
}

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
    questions: decorateQuestions(),
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
    backToModel()
  }
})
