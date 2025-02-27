// targets c_of_q_practice.html
document.addEventListener('DOMContentLoaded', () => {

    const startButton = document.getElementById("start_practice");
    const scoreHolderDiv = document.getElementById("score_holder");
    const questionContainer = document.getElementById("question");
    const answersContainer = document.getElementById("answers");
    const navigationDiv = document.getElementById("navigation");
    const scoreButtonToggle = document.getElementById("toggle_score");
    const scoreDiv = document.getElementById("score");

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
        navigationDiv.style.display = "none";
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
    }

    function checkAnswer(button, selected_answer, correct_answer) {
        const buttons = answersContainer.querySelectorAll("button");

        if (selected_answer === correct_answer) {
            button.style.background = "rgb(154, 226, 72)";
            button.style.color = "black";
            n_correct_answers += 1;
        } else {
            button.style.background = "rgb(226, 85, 72)";
            button.style.color = "black";
            buttons.forEach(btn => {
                btn.style.pointerEvents = "none";
                btn.style.cursor = "default";
                btn.removeEventListener("click", checkAnswer);

                if (btn.textContent === correct_answer) {
                    btn.style.background = "rgb(154, 226, 72)";
                    btn.style.color = "black";
                }
            });
        }

        navigationDiv.style.display = "flex";
        n_total_answers += 1;
        updateScore();
    }

    function getRandomQuestion() {
        if (remainingQuestions.length === 0) {
            // TODO show results
            questionContainer.innerText = "No more questions!";
            return;
        }

        clearQuestion();

        const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
        const selectedQuestion = remainingQuestions.splice(randomIndex, 1)[0];

        questionContainer.innerText = selectedQuestion.question;

        // Multiple choice
        if (selectedQuestion.type == "multiple_choice") {
            let answers = selectedQuestion.wrong_answers.concat([selectedQuestion.correct_answer]);
            answers = shuffleAnswers(answers);

            answers.forEach(answer => {
                const button = document.createElement("button");
                button.textContent = answer;
                button.addEventListener("click", () => checkAnswer(button, answer, selectedQuestion.correct_answer));
                answersContainer.appendChild(button);
            });
        }

        // Short answer

        // Diagram
    }

    loadQuestions();

    startButton.addEventListener("click", function () {
        startButton.remove();
        scoreHolderDiv.style.display = "flex";
        getRandomQuestion();
    });

    navigationDiv.addEventListener("click", function () {
        getRandomQuestion();
    });

    scoreButtonToggle.addEventListener("click", function () {
        toggleScoreButton();
    });

});
