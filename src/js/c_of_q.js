// targets c_of_q_practice.html
document.addEventListener('DOMContentLoaded', () => {

    const startButton = document.getElementById("start_practice");
    const questionContainer = document.getElementById("question");
    const answersContainer = document.getElementById("answers");
    const navigationDiv = document.getElementById("navigation");

    let questions = [];
    let remainingQuestions = [];

    async function loadQuestions() {
        try {
            const response = await fetch("/data/c_of_q.json");
            questions = await response.json();
            remainingQuestions = [...questions];
        } catch (error) {
            console.error("Error loading questions:", error);
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

    function checkAnswer(button, selected_answer, correct_answer) {
        const buttons = answersContainer.querySelectorAll("button");

        if (selected_answer === correct_answer) {
            button.style.background = "rgb(154, 226, 72)";
            button.style.color = "black";
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
        getRandomQuestion();
    });

    navigationDiv.addEventListener("click", function () {
        getRandomQuestion();
    });

});
