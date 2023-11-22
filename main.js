
// essential variables
var marks = 0
var gained_marks = 0
var quiz_category = ""
var quiz_count = 0
var quiz_difficulty = ""
var quiz_grade = ""
var quiz_category_txt = ""
var quiz_date = ""
var quiz_timing = ""

var total_mins = ""
var total_secs = ""
var current_count_down = ""

var loader_len = ""
var progress_px = ""

var ques_no = 0
var all_correct_ans = []
var all_quiz = []
var tic = new Audio("./tick tick.mp3")

// initiates the quiz
const startQuiz = () => {

    let x = document.querySelectorAll(".main form select")

    // getting essential inputs at start
    quiz_category = x[0].value
    quiz_count = x[1].value
    quiz_difficulty = x[2].value

    // getting current date
    let d = new Date()
    quiz_date = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear()

    let quiz_start = document.getElementsByClassName("quiz-start")
    quiz_start[0].style.display = "none"

    let quiz_holder_main = document.getElementsByClassName("quiz-holder-main")
    quiz_holder_main[0].style.display = "flex"

    // enables next button when an answer is selected
    let quiz_holder_lbls = document.querySelectorAll(".quiz-holder label")
    quiz_holder_lbls.forEach((lbl) => {
        lbl.addEventListener("click", () => {
            let b = document.getElementById("next-btn")
            b.disabled = false
        })
    })

    // fetching the quiz
    async function fetchQuiz() {

        const quiz_url = `https://opentdb.com/api.php?amount=${quiz_count}&category=${quiz_category}&difficulty=${quiz_difficulty.toLowerCase()}&type=multiple`

        try {
            const response = await fetch(quiz_url)

            if (!response.ok) {
                throw new Error("Problem in Internet Connection!")
            }

            const data = await response.json()

            all_quiz = data.results

            // decoding the entire fetched data
            all_quiz.forEach(function (question) {
                question.question = decodeHtmlEntities(question.question)
                question.correct_answer = decodeHtmlEntities(question.correct_answer)
                question.incorrect_answers = question.incorrect_answers.map(decodeHtmlEntities)
            })

            quiz_category_txt = all_quiz[0].category

            for (let i in all_quiz) {
                all_correct_ans.push(all_quiz[i].correct_answer)
            }
            setLoader()
            nextQuestion("First Round")
            startTimer()

        }
        catch (error) {
            console.error("There was a problem in getting response.", error)
        }

    }

    fetchQuiz()
    checkAnswer()

}

// method to moves to the next question
const nextQuestion = (arg) => {

    let b = document.getElementById("next-btn")
    b.disabled = true

    if (arg) {
        progressLoader()
    }

    gained_marks += marks
    var all_opts = Array.from(document.querySelectorAll("input[type=radio]"))

    let msg = -1
    for (let j in all_opts) {
        if (all_opts[j].checked == false) {
            msg = 0
        }
        else {
            msg = 1
            progressLoader()
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

        const ques = (`( ${ques_no + 1}/${quiz_count} ) `) + all_quiz[ques_no].question
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

        terminateQuiz()

    }
}

// method that checks answer
const checkAnswer = () => {

    const selected_answers = Array.from(document.querySelectorAll("label"))

    for (let i in selected_answers) {
        selected_answers[i].addEventListener("click", function () {
            const selected_ans_inp = selected_answers[i]
            const selected_ans = selected_ans_inp.textContent

            if (all_correct_ans.includes(selected_ans)) {
                // for correct answer
                marks = 10
            }
            else {
                // when selected wrong answer
                marks = 0
            }
        })
    }
}

// method helps in ending the quiz
const endQuiz = () => {
    let xx = document.getElementsByClassName("quiz-holder-main")
    xx[0].style.display = "none"
    let y = document.getElementsByClassName("quiz-res")
    y[0].style.display = "flex"
    saveScore()
}

// method to calculate the grade
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

// method that handles to view history
const viewHistory = (arg) => {

    if (arg === undefined) {
        let x = document.getElementsByClassName("quiz-res")
        x[0].style.display = "none"
        let y = document.getElementsByClassName("quiz-history")
        y[0].style.display = "block"
        let z = document.querySelector(".quiz-history button:first-child")
        z.innerHTML = `<i class="fa fa-repeat"></i>&nbsp;&nbsp;Try Again?`
    }
    else {
        let x = document.getElementsByClassName("quiz-start")
        x[0].style.display = "none"
        let y = document.getElementsByClassName("quiz-history")
        y[0].style.display = "block"
        let z = document.querySelector(".quiz-history button:first-child")
        z.innerHTML = `<i class="fa fa-arrow-left"></i>&nbsp;&nbsp;Back`
    }

    loadScore()
}

// method to save the score
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

    // to be saved in localstorage
    score = {
        serialNo: serial,
        category: quiz_category_txt,
        questionsCount: quiz_count,
        difficulty: quiz_difficulty,
        finishTime: quiz_timing,
        score: gained_marks,
        grade: quiz_grade,
        date: quiz_date
    }

    let score_txt = JSON.stringify(score)
    localStorage.setItem(`Record-${serial}`, score_txt)
}

// method to terminate the quiz
function terminateQuiz () {

    // calculating marks according to quiz count
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
    var m = Math.floor(current_count_down / 60)
    var s = current_count_down % 60
    quiz_timing = `${padZero(m)}:${padZero(s)} / ${padZero(total_mins)}:${padZero(total_secs)}`
    endQuiz()
}

// method to load all the score on page
const loadScore = () => {

    var full_arr = []

    for (let i = 1; i < localStorage.length; i++) {
        let item = localStorage.getItem(`Record-${i}`)
        full_arr.push(JSON.parse(item))
    }

    // presenting data on score table
    full_arr.forEach(function (element) {

        const myTable = document.getElementsByTagName("tbody")
        const tr = document.createElement("tr")
        const td_1 = document.createElement("td")
        const td_2 = document.createElement("td")
        const td_3 = document.createElement("td")
        const td_4 = document.createElement("td")
        const td_5 = document.createElement("td")
        const td_6 = document.createElement("td")
        const td_7 = document.createElement("td")
        const td_8 = document.createElement("td")
        tr.appendChild(td_1)
        tr.appendChild(td_2)
        tr.appendChild(td_3)
        tr.appendChild(td_4)
        tr.appendChild(td_5)
        tr.appendChild(td_6)
        tr.appendChild(td_7)
        tr.appendChild(td_8)

        myTable[0].appendChild(tr)

        td_1.textContent = element.serialNo
        td_2.textContent = element.category
        td_3.textContent = element.questionsCount
        td_4.textContent = element.difficulty
        td_5.textContent = element.finishTime
        td_6.textContent = element.score
        td_7.textContent = element.grade
        td_8.textContent = element.date
    })

    let t = document.querySelectorAll("table tr")
    let a = document.querySelector("table tr th:first-child")
    let b = document.querySelector("table tr th:last-child")

    if (t.length === 1) {
        a.style.borderBottomLeftRadius = "15px"
        b.style.borderBottomRightRadius = "15px"
    }
}

// method to clear the score from history
const clearScore = () => {

    Object.keys(localStorage).forEach(function (key) {
        localStorage.removeItem(key)
    })

    let msg = "0"
    let tab = Array.from(document.querySelectorAll("table tr:not(:first-child)"))
    tab.forEach(function (element) {
        element.remove()
        msg = "1"
    })

    const clear_msg = document.querySelector(".quiz-history p")
    
    if (msg === "0") {
        clear_msg.textContent = "No Records Found!"
        clear_msg.style.color = "red"
        clear_msg.style.visibility = "visible"
    }
    else {
        clear_msg.textContent = "Records Successfully Deleted!"
        clear_msg.style.color = "green"
        clear_msg.style.visibility = "visible"
    }

    setTimeout(() => {
        clear_msg.style.visibility = "hidden"
    }, 1000)

    let x = document.querySelector("table tr th:first-child")
    let y = document.querySelector("table tr th:last-child")
    x.style.borderBottomLeftRadius = "15px"
    y.style.borderBottomRightRadius = "15px"
}

// method to decode html entities
const decodeHtmlEntities = (text) => {

    var txt = document.createElement('textarea')
    txt.innerHTML = text
    return txt.value
}

// method to set the loader
const setLoader = () => {

    let l = document.querySelector("label[for='quiz-op-1']")
    const l_width = l.offsetWidth.toString()
    let loader = document.getElementsByClassName("loader-holder")
    loader[0].style.maxWidth = `${l_width}px`
    loader_len = l_width
    progress_px = loader_len / quiz_count
}

// method to update loader
const progressLoader = () => {

    const ld = document.getElementsByClassName("loader")
    let current_w = ld[0].offsetWidth
    let new_len = current_w + progress_px
    if (ques_no === quiz_count - 1) {
        new_len = loader_len
    }
    ld[0].style.width = new_len + "px"
}

// method to shuffle an array
const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const startTimer = () => {

    let d = quiz_difficulty
    let q = quiz_count
    let set_count_down = 0

    // change timer according to difficulty
    if (d === "Easy") {
        set_count_down = 13 * q
    }
    else if (d === "Medium") {
        set_count_down = 10 * q
    }
    else {
        set_count_down = 7 * q
    }

    // set the countdown time in seconds
    var countdownTime = set_count_down
    var m2 = Math.floor(set_count_down / 60)
    var s2 = set_count_down % 60
    total_mins = m2
    total_secs = s2

    const updateCountdown = () => {
        current_count_down = countdownTime
        var minutes = Math.floor(countdownTime / 60)
        var seconds = countdownTime % 60;

        // display the time in the format MM:SS
        let display = document.querySelector(".timer p")
        display.textContent = padZero(minutes) + ':' + padZero(seconds)

        if (countdownTime === 30) {      
            tic.play()
            let clock = document.querySelector(".timer i")
            clock.style.color = "red"
            clock.style.animation = "animateClock 2s ease infinite"
        }

        if (countdownTime > 0) {
            countdownTime-- // decrease the countdown time
        } 
        else {

            // when timer is over
            clearInterval(timerInterval) 
            tic.pause()
            display.textContent = "Time's Up!"
            display.style.color = "red"
            display.style.transition = "0.5s ease-in"
            display.style.transform = "scale(1.2)"
            let m1 = Math.floor(set_count_down / 60)
            let s1 = set_count_down % 60
            quiz_timing = `${padZero(m1)}:${padZero(s1)} / ${padZero(m2)}:${padZero(s2)}`

            let ans = Array.from(document.querySelectorAll(".quiz-holder label"))
            let btn = document.getElementById("next-btn")
            btn.disabled = true
            ans.forEach((e) => {
                e.style.pointerEvents = "none"
                e.style.borderColor = "gray"
                e.style.backgroundColor = "rgba(175, 172, 172)"
            })

            setTimeout(() => {
                terminateQuiz()
            }, 5000)
            
        }
    }

    // initial call to set the initial display
    updateCountdown();

    // set up the timer to update the countdown every second
    var timerInterval = setInterval(updateCountdown, 1000);
}

// method to add zero's to the timestamp
const padZero = (value) => {
    return value < 10 ? '0' + value : value;
}
