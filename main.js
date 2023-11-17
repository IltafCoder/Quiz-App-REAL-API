
var marks = 0
var gained_marks = 0
var quiz_category = ""
var quiz_count = 0
var quiz_difficulty = ""
var quiz_grade = ""
var quiz_category_txt = ""
var quiz_date = ""

var ques_no = 0
var all_correct_ans = []
var all_quiz = []

const startQuiz = () => {

    let x = document.querySelectorAll(".main form select")

    quiz_category = x[0].value
    quiz_count = x[1].value
    quiz_difficulty = x[2].value

    let d = new Date()
    quiz_date = d.getDate() + "-" + (d.getMonth() + 1 ) + "-" + d.getFullYear()
    
    let quiz_start = document.getElementsByClassName("quiz-start")
    quiz_start[0].style.display = "none"

    let quiz_holder = document.getElementsByClassName("quiz-holder")
    quiz_holder[0].style.display = "flex"

    async function fetchQuiz() {

        const quiz_url = `https://opentdb.com/api.php?amount=${quiz_count}&category=${quiz_category}&difficulty=${quiz_difficulty.toLowerCase()}&type=multiple`

        try {
            const response = await fetch(quiz_url)

            if (!response.ok) {
                throw new Error("Problem in Internet Connection!")
            }

            const data = await response.json()

            all_quiz = data.results

            all_quiz.forEach(function (question) {
                question.question = decodeHtmlEntities(question.question)
                question.correct_answer = decodeHtmlEntities(question.correct_answer)
                question.incorrect_answers = question.incorrect_answers.map(decodeHtmlEntities)
            })

            quiz_category_txt = all_quiz[0].category

            for (let i in all_quiz) {
                all_correct_ans.push(all_quiz[i].correct_answer)
            }

            nextQuestion("First Round")

        }
        catch (error) {
            console.error("There was a problem in getting response.", error)
        }

    }

    fetchQuiz()
    checkAnswer()

}

const nextQuestion = (arg) => {

    gained_marks += marks
    var all_opts = Array.from(document.querySelectorAll("input[type=radio]"))

    let msg = -1
    for (let j in all_opts) {
        if (all_opts[j].checked == false) {
            msg = 0
        }
        else {
            msg = 1
            break
        }
    }

    if (msg == 0 && arg == undefined) {
        return
    }

    for (let i in all_opts) {
        all_opts[i].checked = false
    }

    if (ques_no <= quiz_count - 1) {

        if (ques_no == quiz_count - 1) {
            let btn = document.getElementById("next-btn")
            btn.innerHTML = "<i class='fa fa-power-off'></i>&nbsp;End Quiz"
        }

        const ques = (`( QNo. ${ques_no + 1} ) `) + all_quiz[ques_no].question
        document.getElementById("quiz-to-ans").textContent = ques

        let all_ans = []
        const c_ans = all_quiz[ques_no].correct_answer
        all_ans.push(c_ans)
        const inc_ans = all_quiz[ques_no].incorrect_answers
        all_ans = all_ans.concat(inc_ans)
        shuffleArray(all_ans)

        for (let i in all_ans) {
            let x = document.querySelector(`label[for='quiz-op-${i}']`)
            x.textContent = all_ans[i]
        }

        ques_no += 1

    }
    else {

        if (quiz_count === 50) {
            gained_marks += gained_marks / 5
        }
        else if (quiz_count === 20) {
            gained_marks += gained_marks / 2
        }
        else if (quiz_count === 30) {
            gained_marks += gained_marks / 3
        }
        else {
            gained_marks = gained_marks
        }

        let x = document.querySelector(".quiz-res div:nth-child(3) p + p")
        x.innerHTML = gained_marks
        calculateGrade(gained_marks)
        endQuiz()
    }
}

const checkAnswer = () => {

    const selected_answers = Array.from(document.querySelectorAll("label"))

    for (let i in selected_answers) {
        selected_answers[i].addEventListener("click", function () {
            const selected_ans_inp = selected_answers[i]
            const selected_ans = selected_ans_inp.textContent

            if (all_correct_ans.includes(selected_ans)) {
                marks = 10
            }
            else {
                marks = 0
            }
        })
    }
}

const endQuiz = () => {
    let x = document.getElementsByClassName("quiz-holder")
    x[0].style.display = "none"
    let y = document.getElementsByClassName("quiz-res")
    y[0].style.display = "flex"
    saveScore()
}

const calculateGrade = (m) => {

    var myGrade = ""
    let gr = document.querySelector(".quiz-res div:nth-child(4) p + p")

    if (m >= 90 && m <= 100) {
        myGrade = "A+"
        gr.style.color = "#00FFFF"
    }
    else if (m >= 80 && m <= 89) {
        myGrade = "A"
        gr.style.color = "#0000FF"
    }
    else if (m >= 70 && m <= 79) {
        myGrade = "B"
        gr.style.color = "#00FF00"
    }
    else if (m >= 60 && m <= 69) {
        myGrade = "C"
        gr.style.color = "#FFFF00"
    }
    else if (m >= 50 && m <= 59) {
        myGrade = "D"
        gr.style.color = "#FFA500"
    }
    else {
        myGrade = "F"
        gr.style.color = "#FF0000"
    }

    quiz_grade = myGrade
    gr.innerHTML = myGrade
}

const viewHistory = (arg) => {

    if (arg === undefined) {
        let x = document.getElementsByClassName("quiz-res")
        x[0].style.display = "none"
        let y = document.getElementsByClassName("quiz-history")
        y[0].style.display = "block"
    }
    else {
        let x = document.getElementsByClassName("quiz-start")
        x[0].style.display = "none"
        let y = document.getElementsByClassName("quiz-history")
        y[0].style.display = "block"
    }

    loadScore()
}

const saveScore = () => {
    
    var serial = ""
    if (localStorage.getItem("Serial No")) {
        let temp = localStorage.getItem("Serial No")
        let temp_int = Number(temp)
        let temp_inc = temp_int + 1
        serial = temp_inc.toString()
        localStorage.setItem("Serial No", serial)
    }
    else {
        localStorage.setItem("Serial No", "1")
        serial = "1"
    }

    score = {
        serialNo: serial,
        category: quiz_category_txt,
        questionsCount: quiz_count,
        difficulty: quiz_difficulty,
        score: gained_marks,
        grade: quiz_grade,
        date: quiz_date
    }

    let score_txt = JSON.stringify(score)
    localStorage.setItem(`Record-${serial}`, score_txt) 
}

const loadScore = () => {

    var full_arr = []

    for (let i = 1; i < localStorage.length; i++) {
        let item = localStorage.getItem(`Record-${i}`)
        full_arr.push(JSON.parse(item))
    }

    full_arr.forEach(function(element) {
        
        const myTable = document.getElementsByTagName("tbody")
        const tr = document.createElement("tr")
        const td_1 = document.createElement("td")
        const td_2 = document.createElement("td")
        const td_3 = document.createElement("td")
        const td_4 = document.createElement("td")
        const td_5 = document.createElement("td")
        const td_6 = document.createElement("td")
        const td_7 = document.createElement("td")
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        tr.appendChild(td_6)
        tr.appendChild(td_7)

        myTable[0].appendChild(tr)

        td_1.textContent = element.serialNo
        td_2.textContent = element.category
        td_3.textContent = element.questionsCount
        td_4.textContent = element.difficulty
        td_5.textContent = element.score
        td_6.textContent = element.grade
        td_7.textContent = element.date
    })

    let t = document.querySelectorAll("table tr")
    let a = document.querySelector("table tr th:first-child")
    let b = document.querySelector("table tr th:last-child")
    
    if (t.length === 1) {
        a.style.borderBottomLeftRadius = "15px"
        b.style.borderBottomRightRadius = "15px"
    }
}

const clearScore = () => {

    Object.keys(localStorage).forEach(function (key) {
        localStorage.removeItem(key)
    })

    let tab = Array.from(document.querySelectorAll("table tr:not(:first-child)"))
    tab.forEach(function (element) {
        element.remove()
    })

    let x = document.querySelector("table tr th:first-child")
    let y = document.querySelector("table tr th:last-child")
    x.style.borderBottomLeftRadius = "15px"
    y.style.borderBottomRightRadius = "15px"
}

const decodeHtmlEntities = (text) => {
    var txt = document.createElement('textarea')
    txt.innerHTML = text
    return txt.value
}

const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}