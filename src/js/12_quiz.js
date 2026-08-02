/**
 * 12_quiz.js
 * Interactive Chemistry Quiz Game & Practice Mode
 */

let quizScore = 0;
let quizStreak = 0;
let currentQuestionIndex = 0;
let quizQuestions = [];

function initQuizView() {
    setupQuizUI();
    generateQuizQuestions();
    renderQuestion();
}

function setupQuizUI() {
    const nextBtn = document.getElementById('quiz-next-btn');
    const resetBtn = document.getElementById('quiz-reset-btn');

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentQuestionIndex = (currentQuestionIndex + 1) % quizQuestions.length;
            renderQuestion();
        };
    }

    if (resetBtn) {
        resetBtn.onclick = () => {
            quizScore = 0;
            quizStreak = 0;
            currentQuestionIndex = 0;
            generateQuizQuestions();
            renderQuestion();
            updateQuizHeader();
        };
    }
}

function generateQuizQuestions() {
    quizQuestions = [
        {
            type: 'Symbol',
            question: 'What is the chemical symbol for Gold?',
            options: ['Ag', 'Au', 'Fe', 'Gd'],
            correct: 1,
            explanation: 'Au comes from the Latin word "Aurum", meaning shining dawn.'
        },
        {
            type: 'Atomic Number',
            question: 'Which element has the atomic number 6?',
            options: ['Nitrogen', 'Oxygen', 'Carbon', 'Boron'],
            correct: 2,
            explanation: 'Carbon has Z=6 and forms the backbone of organic chemistry.'
        },
        {
            type: 'Isotopes',
            question: 'What is the half-life of Carbon-14 used in radiocarbon dating?',
            options: ['5,730 years', '12.3 years', '24,100 years', '1.2 billion years'],
            correct: 0,
            explanation: 'Carbon-14 decays via Beta-minus with a half-life of 5,730 years.'
        },
        {
            type: 'Compounds',
            question: 'What is the chemical formula for Sodium Bicarbonate (Baking Soda)?',
            options: ['NaCl', 'NaOH', 'NaHCO3', 'Na2CO3'],
            correct: 2,
            explanation: 'NaHCO3 reacts with acid to produce carbon dioxide gas in baking.'
        },
        {
            type: 'Electronegativity',
            question: 'Which element is the most electronegative on the Pauling scale?',
            options: ['Oxygen', 'Chlorine', 'Fluorine', 'Helium'],
            correct: 2,
            explanation: 'Fluorine has the highest electronegativity value of 3.98.'
        },
        {
            type: 'Reactions',
            question: 'What type of reaction is: CH4 + 2O2 -> CO2 + 2H2O?',
            options: ['Decomposition', 'Combustion', 'Synthesis', 'Double Replacement'],
            correct: 1,
            explanation: 'Reaction of a hydrocarbon with oxygen producing CO2 and H2O is combustion.'
        },
        {
            type: 'Crystallography',
            question: 'Which crystal structure has the highest atomic packing efficiency of 74%?',
            options: ['Simple Cubic (SC)', 'Body-Centered Cubic (BCC)', 'Face-Centered Cubic (FCC)', 'Diamond Cubic'],
            correct: 2,
            explanation: 'FCC and HCP both achieve maximum packing efficiency of 74%.'
        }
    ];
}

function renderQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    if (!q) return;

    const qNum = document.getElementById('quiz-q-num');
    const qText = document.getElementById('quiz-q-text');
    const qBadge = document.getElementById('quiz-cat-badge');
    const optionsContainer = document.getElementById('quiz-options-container');
    const explBox = document.getElementById('quiz-explanation-box');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (qNum) qNum.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    if (qText) qText.textContent = q.question;
    if (qBadge) qBadge.textContent = q.type;
    if (explBox) explBox.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;

            btn.onclick = () => {
                const allBtns = optionsContainer.querySelectorAll('.quiz-option-btn');
                allBtns.forEach(b => b.disabled = true);

                if (idx === q.correct) {
                    btn.classList.add('correct');
                    quizScore += 10;
                    quizStreak += 1;
                } else {
                    btn.classList.add('wrong');
                    allBtns[q.correct].classList.add('correct');
                    quizStreak = 0;
                }

                if (explBox) {
                    explBox.textContent = `💡 Explanation: ${q.explanation}`;
                    explBox.style.display = 'block';
                }

                if (nextBtn) nextBtn.style.display = 'inline-block';
                updateQuizHeader();
            };

            optionsContainer.appendChild(btn);
        });
    }
}

function updateQuizHeader() {
    const scoreEl = document.getElementById('quiz-score-val');
    const streakEl = document.getElementById('quiz-streak-val');
    if (scoreEl) scoreEl.textContent = quizScore;
    if (streakEl) streakEl.textContent = quizStreak > 0 ? `🔥 ${quizStreak}` : '0';
}
