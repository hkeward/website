// targets c_of_q_practice.html
document.addEventListener('DOMContentLoaded', () => {

    const startButton = document.getElementById("start_practice");
    const scoreHolderDiv = document.getElementById("score_holder");
    const questionContainer = document.getElementById("question");
    const answersContainer = document.getElementById("answers");
    const multipleChoiceNavigationDiv = document.getElementById("multiple_choice_nav");
    const scoreButtonToggle = document.getElementById("toggle_score");
    const scoreDiv = document.getElementById("score");
    const skipButton = document.getElementById("skip");
    const restartButton = document.getElementById("restart");
    const endNowButton = document.getElementById("end_now");
    const shortAnswerNavigationDiv = document.getElementById("short_answer_nav");
    const shortAnswerCorrectButton = document.getElementById("correct");
    const shortAnswerIncorrectButton = document.getElementById("incorrect");

    let questions = [];
    let remainingQuestions = [];

    let n_correct_answers = 0;
    let n_total_answers = 0;

    let wrong_questions = [];

    async function loadQuestions() {
        try {
            const response = await fetch("/data/c_of_q.json");
            questions = await response.json();
            remainingQuestions = [...questions];
        } catch (error) {
            console.error("Error loading questions:", error);
        }
    }

    function toggleScoreButton() {
        buttonText = scoreButtonToggle.innerText;
        if (buttonText == "Hide score") {
            scoreButtonToggle.innerText = "Show score";
            scoreDiv.style.visibility = "hidden";
        } else {
            scoreButtonToggle.innerText = "Hide score";
            scoreDiv.style.visibility = "visible";
        }
    }

    function clearQuestion() {
        questionContainer.innerText = "";
        while (answersContainer.firstChild) {
            answersContainer.removeChild(answersContainer.firstChild);
        }
        multipleChoiceNavigationDiv.style.display = "none";
        shortAnswerNavigationDiv.style.display = "none";
    }

    function shuffleAnswers(answers) {
        for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }
        return answers;
    }

    function updateScore() {
        correct_answers_proportion = Math.round(n_correct_answers / n_total_answers * 100);
        scoreDiv.innerText = `${n_correct_answers} / ${n_total_answers} (${correct_answers_proportion} %)`;

        let score_color;

        if (correct_answers_proportion < 50) {
            score_color = "rgb(226, 85, 72)";
        } else if (50 <= correct_answers_proportion && correct_answers_proportion < 70) {
            score_color = "rgb(234, 200, 63)";
        } else if (70 <= correct_answers_proportion && correct_answers_proportion < 80) {
            score_color = "rgb(184, 238, 60)";
        } else if (80 <= correct_answers_proportion && correct_answers_proportion < 90) {
            score_color = "rgb(144, 197, 20)";
        }
        else {
            score_color = "rgb(22, 218, 32)";
        }

        scoreDiv.style.color = score_color;
    }

    // Multiple choice questions 
    function checkAnswer(button, selected_answer, question) {
        const buttons = answersContainer.querySelectorAll("button");

        if (selected_answer === question.answer) {
            button.style.background = "rgb(154, 226, 72)";
            button.style.color = "black";
            n_correct_answers += 1;
        } else {
            button.style.background = "rgb(226, 85, 72)";
            button.style.color = "black";
            wrong_questions.push(question);
        }

        buttons.forEach(btn => {
            btn.style.pointerEvents = "none";
            btn.style.cursor = "default";
            btn.removeEventListener("click", checkAnswer);

            if (btn.textContent === question.answer) {
                btn.style.background = "rgb(154, 226, 72)";
                btn.style.color = "black";
            }
        });

        if ("erratta" in question) {
            const errattaDiv = document.createElement("div");
            errattaDiv.innerText = question.erratta;
            errattaDiv.style.fontStyle = "italic";
            errattaDiv.style.color = "white";
            answersContainer.appendChild(errattaDiv);
        }

        multipleChoiceNavigationDiv.style.display = "flex";
        n_total_answers += 1;
        updateScore();
    }

    // Short answer questions
    function showShortAnswer(button, question) {
        button.remove();
        const answerDiv = document.createElement("div");
        answerDiv.textContent = question.answer;
        answerDiv.style.color = "white";
        answerDiv.style.fontSize = "1.5em";
        answerDiv.style.border = "2px solid rgb(154, 226, 72)";
        answerDiv.style.borderRadius = "8px";
        answerDiv.style.padding = "10px";
        answersContainer.appendChild(answerDiv);
        shortAnswerNavigationDiv.style.display = "flex";

        shortAnswerCorrectButton.addEventListener("click", function () {
            incrementScore(correct = true, question);
        });

        shortAnswerIncorrectButton.addEventListener("click", function () {
            incrementScore(correct = false, question);
        });
    }

    function incrementScore(correct, question) {
        if (correct == true) {
            n_correct_answers += 1;
        } else {
            wrong_questions.push(question);
        }
        n_total_answers += 1;
        updateScore();
        getRandomQuestion();
    }

    function showResults() {
        clearQuestion();
        let correct_answers_proportion = Math.round(n_correct_answers / n_total_answers * 100);
        let pass_fail = correct_answers_proportion >= 70 ? "passed!!!!" : "failed :( But try again, you got this!!"
        questionContainer.innerText = `Finished -- You ${pass_fail}`;
        if (scoreButtonToggle.innerText == "Show score") {
            toggleScoreButton();
        }

        skipButton.remove();
        endNowButton.remove();
        scoreButtonToggle.remove();

        const wrongQuestionsDiv = document.createElement("div");
        wrongQuestionsDiv.classList.add("flexbox-columns");
        let wrongQuestionsHeader = document.createElement("h4");
        wrongQuestionsHeader.innerText = "Questions you got wrong";
        wrongQuestionsHeader.style.marginBottom = "0px";
        wrongQuestionsDiv.appendChild(wrongQuestionsHeader);
        wrong_questions.forEach(function (question) {
            let questionDiv = document.createElement("div");
            questionDiv.classList.add("flexbox-container");
            questionDiv.style.border = "1px solid rgb(226, 85, 72)";
            questionDiv.style.borderRadius = "8px";
            questionDiv.style.padding = "10px";
            let questionContentsDiv = document.createElement("div");
            questionContentsDiv.innerText = question.question;
            questionContentsDiv.style.flex = 3;
            questionContentsDiv.style.fontSize = "0.7em";
            questionContentsDiv.style.color = "white";
            if ("img" in question) {
                let questionImg = document.createElement("img");
                questionImg.src = question.img;
                questionContentsDiv.appendChild(questionImg);
            }
            let questionAnswer = document.createElement("div");
            questionAnswer.innerText = question.answer;
            questionAnswer.style.flex = 1;
            questionAnswer.style.fontSize = "0.7em";
            questionDiv.appendChild(questionContentsDiv);
            questionDiv.appendChild(questionAnswer);
            wrongQuestionsDiv.appendChild(questionDiv);
        });
        questionContainer.appendChild(wrongQuestionsDiv);
    }

    function getRandomQuestion() {
        clearQuestion();

        if (remainingQuestions.length === 0) {
            showResults();
        } else {
            const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
            const selectedQuestion = remainingQuestions.splice(randomIndex, 1)[0];

            questionContainer.innerText = selectedQuestion.question;

            if ("img" in selectedQuestion) {
                const imgContainer = document.createElement("div");
                const imgElement = document.createElement("img");
                imgElement.src = selectedQuestion.img;
                imgContainer.appendChild(imgElement);
                answersContainer.appendChild(imgContainer);
            }

            if (selectedQuestion.type == "multiple_choice") {
                let answers = selectedQuestion.wrong_answers.concat([selectedQuestion.answer]);
                answers = shuffleAnswers(answers);

                answers.forEach(answer => {
                    const button = document.createElement("button");
                    button.textContent = answer;
                    button.addEventListener("click", () => checkAnswer(button, answer, selectedQuestion));
                    answersContainer.appendChild(button);
                });
            } else if (selectedQuestion.type == "short_answer") {
                const button = document.createElement("button");
                button.textContent = "Show answer";
                button.addEventListener("click", () => showShortAnswer(button, selectedQuestion));
                answersContainer.appendChild(button);
            }
        }
    }

    loadQuestions();

    startButton.addEventListener("click", function () {
        startButton.remove();
        scoreHolderDiv.style.display = "flex";
        getRandomQuestion();
    });

    multipleChoiceNavigationDiv.addEventListener("click", function () {
        getRandomQuestion();
    });

    scoreButtonToggle.addEventListener("click", function () {
        toggleScoreButton();
    });

    skipButton.addEventListener("click", function () {
        getRandomQuestion();
    });

    endNowButton.addEventListener("click", function () {
        showResults();
    });

    restartButton.addEventListener("click", function () {
        location.reload();
    })
});
