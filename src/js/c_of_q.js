// targets c_of_q_practice.html
document.addEventListener('DOMContentLoaded', () => {

    const startButton = document.getElementById("start_practice");
    const scoreHolderDiv = document.getElementById("score_holder");
    const questionContainer = document.getElementById("question");
    const answersContainer = document.getElementById("answers");
    const multipleChoiceNavigationDiv = document.getElementById("multiple_choice_nav");
    const scoreButtonToggle = document.getElementById("toggle_score");
    const scoreDiv = document.getElementById("score");
    const restartButton = document.getElementById("restart");
    const shortAnswerNavigationDiv = document.getElementById("short_answer_nav");
    const shortAnswerCorrectButton = document.getElementById("correct");
    const shortAnswerIncorrectButton = document.getElementById("incorrect");

    let questions = [];
    let remainingQuestions = [];

    let n_correct_answers = 0;
    let n_total_answers = 0;

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
    function checkAnswer(button, selected_answer, correct_answer) {
        const buttons = answersContainer.querySelectorAll("button");

        if (selected_answer === correct_answer) {
            button.style.background = "rgb(154, 226, 72)";
            button.style.color = "black";
            n_correct_answers += 1;
        } else {
            button.style.background = "rgb(226, 85, 72)";
            button.style.color = "black";
        }

        buttons.forEach(btn => {
            btn.style.pointerEvents = "none";
            btn.style.cursor = "default";
            btn.removeEventListener("click", checkAnswer);

            if (btn.textContent === correct_answer) {
                btn.style.background = "rgb(154, 226, 72)";
                btn.style.color = "black";
            }
        });

        multipleChoiceNavigationDiv.style.display = "flex";
        n_total_answers += 1;
        updateScore();
    }

    // Short answer questions
    function showShortAnswer(button, answer) {
        button.remove();
        const answerDiv = document.createElement("div");
        answerDiv.textContent = answer;
        answerDiv.style.color = "white";
        answerDiv.style.fontSize = "1.5em";
        answerDiv.style.border = "2px solid rgb(154, 226, 72)";
        answerDiv.style.borderRadius = "8px";
        answerDiv.style.padding = "10px";
        answersContainer.appendChild(answerDiv);
        shortAnswerNavigationDiv.style.display = "flex";
    }

    function incrementScore(n_correct) {
        n_correct_answers += n_correct;
        n_total_answers += 1;
        updateScore();
        getRandomQuestion();
    }

    function getRandomQuestion() {
        clearQuestion();

        if (remainingQuestions.length === 0) {
            let correct_answers_proportion = Math.round(n_correct_answers / n_total_answers * 100);
            let pass_fail = correct_answers_proportion >= 70 ? "passed!!!!" : "failed :( But try again, you got this!!"
            questionContainer.innerText = `Finished all questions -- You ${pass_fail}`;
            if (scoreButtonToggle.innerText == "Show score") {
                toggleScoreButton();
            }
        } else {
            const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
            const selectedQuestion = remainingQuestions.splice(randomIndex, 1)[0];

            questionContainer.innerText = selectedQuestion.question;

            if (selectedQuestion.type == "multiple_choice") {
                let answers = selectedQuestion.wrong_answers.concat([selectedQuestion.correct_answer]);
                answers = shuffleAnswers(answers);

                answers.forEach(answer => {
                    const button = document.createElement("button");
                    button.textContent = answer;
                    button.addEventListener("click", () => checkAnswer(button, answer, selectedQuestion.correct_answer));
                    answersContainer.appendChild(button);
                });
            } else if (selectedQuestion.type == "short_answer") {
                const button = document.createElement("button");
                button.textContent = "Show answer";
                button.addEventListener("click", () => showShortAnswer(button, selectedQuestion.answer));
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

    restartButton.addEventListener("click", function () {
        location.reload();
    })

    shortAnswerCorrectButton.addEventListener("click", function () {
        incrementScore(1);
    });

    shortAnswerIncorrectButton.addEventListener("click", function () {
        incrementScore(0);
    });
});
