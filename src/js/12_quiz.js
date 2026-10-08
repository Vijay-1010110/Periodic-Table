/**
 * 12_quiz.js
 * Interactive Chemistry Quiz Game, Procedural Question Engine,
 * Categories, Streaks, Progress Tracking, and Round Summary
 */

var quizScore = 0;
var quizStreak = 0;
var quizBestStreak = 0;
var currentQuestionIndex = 0;
var currentQuizCategory = 'all';
const QUIZ_ROUND_LENGTH = 10;
var quizQuestions = [];
var quizUserAnswers = [];
var quizHighScore = 0;

var quizViewInitialized = false;

function initQuizView() {
    if (!quizViewInitialized) {
        try {
            quizHighScore = parseInt(localStorage.getItem('periodica_quiz_highscore') || '0', 10);
        } catch (e) {
            quizHighScore = 0;
        }
        setupQuizUI();
        startNewQuizRound();
        quizViewInitialized = true;
    }
}

function setupQuizUI() {
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
        nextBtn.onclick = () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                renderQuestion();
            } else {
                showQuizSummary();
            }
        };
    }
}

function selectQuizCategory(cat) {
    currentQuizCategory = cat;
    const pills = document.querySelectorAll('.quiz-cat-pill');
    pills.forEach(p => {
        if (p.dataset.cat === cat) p.classList.add('active');
        else p.classList.remove('active');
    });
    startNewQuizRound();
}
window.selectQuizCategory = selectQuizCategory;

function restartQuizRound() {
    startNewQuizRound();
}
window.restartQuizRound = restartQuizRound;

function startNewQuizRound() {
    currentQuestionIndex = 0;
    quizScore = 0;
    quizStreak = 0;
    quizBestStreak = 0;
    quizUserAnswers = [];

    quizQuestions = generateRoundQuestions(currentQuizCategory, QUIZ_ROUND_LENGTH);

    // Switch back to active card
    const activeCard = document.getElementById('quiz-card-active');
    const summaryCard = document.getElementById('quiz-summary-card');
    const progressWrap = document.getElementById('quiz-progress-wrap');
    if (activeCard) activeCard.style.display = 'block';
    if (summaryCard) summaryCard.style.display = 'none';
    if (progressWrap) progressWrap.style.display = 'block';

    updateQuizHeader();
    renderProgressDots();
    renderQuestion();
}

function updateQuizHeader() {
    const scoreVal = document.getElementById('quiz-score-val');
    const streakVal = document.getElementById('quiz-streak-val');
    const multBadge = document.getElementById('quiz-multiplier-badge');
    const bestVal = document.getElementById('quiz-best-val');

    if (scoreVal) scoreVal.textContent = quizScore;
    if (streakVal) streakVal.textContent = quizStreak;
    if (bestVal) bestVal.textContent = quizHighScore;

    if (multBadge) {
        if (quizStreak >= 5) {
            multBadge.textContent = '2.0x 🔥';
            multBadge.className = 'qsp-mult mega';
        } else if (quizStreak >= 3) {
            multBadge.textContent = '1.5x ⚡';
            multBadge.className = 'qsp-mult boost';
        } else {
            multBadge.textContent = '1x';
            multBadge.className = 'qsp-mult';
        }
    }
}

function renderProgressDots() {
    const dotsContainer = document.getElementById('quiz-progress-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = quizQuestions.map((q, idx) => {
        const userAns = quizUserAnswers[idx];
        let statusClass = 'pending';
        if (userAns) {
            statusClass = userAns.isCorrect ? 'correct' : 'wrong';
        } else if (idx === currentQuestionIndex) {
            statusClass = 'active';
        }
        return `<div class="quiz-dot ${statusClass}" title="Q${idx + 1}"></div>`;
    }).join('');
}

function renderQuestion() {
    const q = quizQuestions[currentQuestionIndex];
    if (!q) {
        showQuizSummary();
        return;
    }

    const qNum = document.getElementById('quiz-q-num');
    const qText = document.getElementById('quiz-q-text');
    const qBadge = document.getElementById('quiz-cat-badge');
    const optionsContainer = document.getElementById('quiz-options-container');
    const explBox = document.getElementById('quiz-explanation-box');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (qNum) qNum.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    if (qText) qText.textContent = q.question;
    if (qBadge) qBadge.textContent = q.category || 'Chemistry';
    if (explBox) explBox.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    renderProgressDots();

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerHTML = `
                <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
                <span class="opt-text">${opt}</span>
            `;

            btn.onclick = () => {
                const allBtns = optionsContainer.querySelectorAll('.quiz-option-btn');
                allBtns.forEach(b => b.disabled = true);

                const isCorrect = (idx === q.correct);
                quizUserAnswers[currentQuestionIndex] = {
                    question: q.question,
                    selectedOption: opt,
                    correctOption: q.options[q.correct],
                    isCorrect: isCorrect,
                    explanation: q.explanation
                };

                if (isCorrect) {
                    btn.classList.add('correct');
                    quizStreak++;
                    if (quizStreak > quizBestStreak) quizBestStreak = quizStreak;

                    const mult = quizStreak >= 5 ? 2.0 : (quizStreak >= 3 ? 1.5 : 1.0);
                    quizScore += Math.round(10 * mult);

                    if (quizScore > quizHighScore) {
                        quizHighScore = quizScore;
                        try {
                            localStorage.setItem('periodica_quiz_highscore', String(quizHighScore));
                        } catch (e) {}
                    }

                    if (window.NativeServices?.Haptics) {
                        window.NativeServices.Haptics.notification('SUCCESS');
                    }
                } else {
                    btn.classList.add('wrong');
                    if (allBtns[q.correct]) allBtns[q.correct].classList.add('correct');
                    quizStreak = 0;

                    if (window.NativeServices?.Haptics) {
                        window.NativeServices.Haptics.notification('ERROR');
                    }
                }

                updateQuizHeader();
                renderProgressDots();

                if (explBox) {
                    explBox.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</strong> ${q.explanation}`;
                    explBox.style.display = 'block';
                }

                if (nextBtn) {
                    nextBtn.textContent = (currentQuestionIndex + 1 === quizQuestions.length) ? 'View Results 🏆' : 'Next Question ➔';
                    nextBtn.style.display = 'inline-flex';
                }
            };

            optionsContainer.appendChild(btn);
        });
    }
}

function showQuizSummary() {
    const activeCard = document.getElementById('quiz-card-active');
    const summaryCard = document.getElementById('quiz-summary-card');
    const progressWrap = document.getElementById('quiz-progress-wrap');

    if (activeCard) activeCard.style.display = 'none';
    if (progressWrap) progressWrap.style.display = 'none';
    if (summaryCard) summaryCard.style.display = 'block';

    const correctCount = quizUserAnswers.filter(a => a && a.isCorrect).length;
    const totalCount = quizQuestions.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    let badgeIcon = '🥉';
    let rankTitle = 'Chemistry Apprentice';
    let rankDesc = 'Good start! Practice regularly to master periodic trends and reactions.';

    if (accuracy === 100) {
        badgeIcon = '🏆';
        rankTitle = 'Nobel Laureate Chemist!';
        rankDesc = 'Flawless performance! You have complete mastery of elements and reactions.';
    } else if (accuracy >= 80) {
        badgeIcon = '🥇';
        rankTitle = 'Senior Research Chemist!';
        rankDesc = 'Exceptional knowledge! Outstanding command of periodic table concepts.';
    } else if (accuracy >= 60) {
        badgeIcon = '🥈';
        rankTitle = 'Lab Investigator';
        rankDesc = 'Solid foundation. Review your missed answers to reach the top tier.';
    }

    const badgeEl = document.getElementById('summary-badge-wrap');
    const titleEl = document.getElementById('summary-rank-title');
    const descEl = document.getElementById('summary-rank-desc');
    const finalScoreEl = document.getElementById('sum-final-score');
    const accuracyEl = document.getElementById('sum-accuracy');
    const streakEl = document.getElementById('sum-best-streak');

    if (badgeEl) badgeEl.textContent = badgeIcon;
    if (titleEl) titleEl.textContent = rankTitle;
    if (descEl) descEl.textContent = rankDesc;
    if (finalScoreEl) finalScoreEl.textContent = quizScore;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    if (streakEl) streakEl.textContent = quizBestStreak;

    // Render Review List
    const reviewList = document.getElementById('quiz-review-list');
    if (reviewList) {
        reviewList.style.display = 'none'; // closed by default
        reviewList.innerHTML = quizUserAnswers.map((ans, idx) => `
            <div class="review-item ${ans.isCorrect ? 'correct' : 'wrong'}">
                <div class="review-q-header">
                    <span class="review-q-num">Q${idx + 1}</span>
                    <span class="review-q-title">${ans.question}</span>
                </div>
                <div class="review-q-body">
                    <div class="review-ans-row">
                        <span class="ans-label">Your Answer:</span>
                        <span class="ans-val ${ans.isCorrect ? 'good' : 'bad'}">${ans.selectedOption}</span>
                    </div>
                    ${!ans.isCorrect ? `
                    <div class="review-ans-row">
                        <span class="ans-label">Correct:</span>
                        <span class="ans-val good">${ans.correctOption}</span>
                    </div>` : ''}
                    <div class="review-expl">💡 ${ans.explanation}</div>
                </div>
            </div>
        `).join('');
    }
}

function toggleQuizReview() {
    const list = document.getElementById('quiz-review-list');
    if (!list) return;
    list.style.display = (list.style.display === 'none' || !list.style.display) ? 'block' : 'none';
}
window.toggleQuizReview = toggleQuizReview;

// ===================== PROCEDURAL QUESTION GENERATOR =====================

function generateRoundQuestions(category, count) {
    const generated = [];
    const usedQuestions = new Set();

    let attempts = 0;
    while (generated.length < count && attempts < 100) {
        attempts++;
        const q = generateSingleQuestion(category);
        if (q && !usedQuestions.has(q.question)) {
            usedQuestions.add(q.question);
            generated.push(q);
        }
    }

    // Fallback if needed
    while (generated.length < count) {
        generated.push(staticCuratedQuestions[generated.length % staticCuratedQuestions.length]);
    }

    return generated;
}

function generateSingleQuestion(category) {
    let cat = category;
    if (cat === 'all') {
        const cats = ['symbols', 'trends', 'isotopes', 'reactions', 'crystals'];
        cat = cats[Math.floor(Math.random() * cats.length)];
    }

    if (cat === 'symbols') return generateSymbolQuestion();
    if (cat === 'trends') return generateTrendQuestion();
    if (cat === 'isotopes') return generateIsotopeQuestion();
    if (cat === 'reactions') return generateReactionQuestion();
    if (cat === 'crystals') return generateCrystalQuestion();

    return generateSymbolQuestion();
}

// Helpers
function getRandomElements(n, excludeZ = 0) {
    if (typeof elementsData === 'undefined') return [];
    const pool = elementsData.filter(e => e.atomicNumber !== excludeZ && e.atomicNumber <= 118);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

function shuffle(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateSymbolQuestion() {
    if (typeof elementsData === 'undefined') return staticCuratedQuestions[0];
    const el = elementsData[Math.floor(Math.random() * 110)];
    const distractors = getRandomElements(3, el.atomicNumber);

    const qTypes = ['symbolFromName', 'nameFromSymbol', 'atomicNumber', 'block'];
    const type = qTypes[Math.floor(Math.random() * qTypes.length)];

    if (type === 'symbolFromName') {
        const opts = shuffle([el.symbol, ...distractors.map(d => d.symbol)]);
        return {
            category: 'Elements & Symbols',
            question: `What is the chemical symbol for ${el.name}?`,
            options: opts,
            correct: opts.indexOf(el.symbol),
            explanation: `${el.name} has atomic number ${el.atomicNumber} and symbol ${el.symbol} in the ${el.category} group.`
        };
    } else if (type === 'nameFromSymbol') {
        const opts = shuffle([el.name, ...distractors.map(d => d.name)]);
        return {
            category: 'Elements & Symbols',
            question: `Which chemical element is represented by the symbol "${el.symbol}"?`,
            options: opts,
            correct: opts.indexOf(el.name),
            explanation: `Symbol "${el.symbol}" belongs to ${el.name} (Z = ${el.atomicNumber}).`
        };
    } else if (type === 'atomicNumber') {
        const opts = shuffle([el.name, ...distractors.map(d => d.name)]);
        return {
            category: 'Elements & Symbols',
            question: `Which element has the atomic number ${el.atomicNumber}?`,
            options: opts,
            correct: opts.indexOf(el.name),
            explanation: `${el.name} has ${el.atomicNumber} protons in its nucleus, defining its atomic number Z=${el.atomicNumber}.`
        };
    } else {
        const allBlocks = ['s-block', 'p-block', 'd-block', 'f-block'];
        const correctBlock = `${el.block.toLowerCase()}-block`;
        return {
            category: 'Elements & Symbols',
            question: `Which orbital block does ${el.name} (${el.symbol}) belong to?`,
            options: allBlocks,
            correct: allBlocks.indexOf(correctBlock),
            explanation: `${el.name} has outer valence electrons entering the ${correctBlock.toUpperCase()} shell.`
        };
    }
}

function generateTrendQuestion() {
    if (typeof elementsData === 'undefined') return staticCuratedQuestions[4];
    const trendTypes = ['electronegativity', 'radius', 'density'];
    const trend = trendTypes[Math.floor(Math.random() * trendTypes.length)];

    if (trend === 'electronegativity') {
        const nobleGases = ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'];
        const pool = elementsData.filter(e => typeof e.electronegativity === 'number' && e.electronegativity > 0 && !nobleGases.includes(e.symbol) && e.atomicNumber <= 83);
        const sample = [...pool].sort(() => 0.5 - Math.random()).slice(0, 4);
        if (sample.length < 4) return staticCuratedQuestions[4];
        sample.sort((a, b) => b.electronegativity - a.electronegativity);

        const target = sample[0]; // highest
        const opts = shuffle(sample.map(s => s.name));
        return {
            category: 'Periodic Trends',
            question: `Which of these elements has the HIGHEST electronegativity on the Pauling scale?`,
            options: opts,
            correct: opts.indexOf(target.name),
            explanation: `${target.name} (${target.symbol}) has an electronegativity of ${target.electronegativity}, which is higher than ${sample.slice(1).map(s => s.name + ' (' + s.electronegativity + ')').join(', ')}.`
        };
    } else if (trend === 'radius') {
        const pool = elementsData.filter(e => e.radius && (typeof e.radius.calculated === 'number' || typeof e.radius.vanDerWaals === 'number') && e.atomicNumber <= 56);
        const sample = [...pool].sort(() => 0.5 - Math.random()).slice(0, 4);
        if (sample.length < 4) return staticCuratedQuestions[4];
        sample.sort((a, b) => {
            const rA = a.radius.calculated || a.radius.vanDerWaals || 0;
            const rB = b.radius.calculated || b.radius.vanDerWaals || 0;
            return rB - rA;
        });

        const target = sample[0]; // largest
        const targetRadius = target.radius.calculated || target.radius.vanDerWaals;
        const opts = shuffle(sample.map(s => s.name));
        return {
            category: 'Periodic Trends',
            question: `Which of these elements has the LARGEST atomic radius?`,
            options: opts,
            correct: opts.indexOf(target.name),
            explanation: `${target.name} has an atomic radius of ~${targetRadius} pm, expanding down its periodic group.`
        };
    } else {
        const pool = elementsData.filter(e => typeof e.density === 'number' && e.density > 0 && e.atomicNumber <= 83);
        const sample = [...pool].sort(() => 0.5 - Math.random()).slice(0, 4);
        if (sample.length < 4) return staticCuratedQuestions[4];
        sample.sort((a, b) => b.density - a.density);

        const target = sample[0]; // densest
        const opts = shuffle(sample.map(s => s.name));
        return {
            category: 'Periodic Trends',
            question: `Which of these elements has the GREATEST physical density at STP?`,
            options: opts,
            correct: opts.indexOf(target.name),
            explanation: `${target.name} has a density of ${target.density} g/cm³, due to tight atomic packing and high nuclear mass.`
        };
    }
}

function generateIsotopeQuestion() {
    const questions = [
        {
            category: 'Isotopes & Nuclear',
            question: 'What is the half-life of Carbon-14 used in radiocarbon dating?',
            options: ['5,730 years', '1,250 years', '24,100 years', '12.3 years'],
            correct: 0,
            explanation: 'Carbon-14 beta-decays into Nitrogen-14 with a half-life of 5,730 ± 40 years.'
        },
        {
            category: 'Isotopes & Nuclear',
            question: 'Which hydrogen isotope contains 1 proton and 2 neutrons?',
            options: ['Protium', 'Deuterium', 'Tritium', 'Helium-3'],
            correct: 2,
            explanation: 'Tritium (³H) contains 1 proton and 2 neutrons (A = 3) and is mildly radioactive.'
        },
        {
            category: 'Isotopes & Nuclear',
            question: 'What particle is emitted during Alpha (α) decay?',
            options: ['Helium-4 nucleus (2p + 2n)', 'High-energy electron (e⁻)', 'Positron (e⁺)', 'High-energy photon'],
            correct: 0,
            explanation: 'An alpha particle is identical to a Helium-4 nucleus: 2 protons and 2 neutrons.'
        },
        {
            category: 'Isotopes & Nuclear',
            question: 'Which of the following is a "Magic Number" of nucleons granting exceptional nuclear stability?',
            options: ['14', '28', '35', '42'],
            correct: 1,
            explanation: 'Nuclear magic numbers (2, 8, 20, 28, 50, 82, 126) correspond to completely filled nuclear shells.'
        },
        {
            category: 'Isotopes & Nuclear',
            question: 'In Beta-minus (β⁻) decay, what fundamental transformation occurs inside the nucleus?',
            options: ['A proton turns into a neutron', 'A neutron turns into a proton + electron', 'Two protons fuse together', 'A neutron is directly ejected'],
            correct: 1,
            explanation: 'Weak interaction converts a down quark into an up quark: n ➔ p + e⁻ + ν̅e.'
        }
    ];
    return questions[Math.floor(Math.random() * questions.length)];
}

function generateReactionQuestion() {
    const rxns = [
        {
            category: 'Reactions',
            question: 'What is the stoichiometric coefficient of O₂ when balancing: CH₄ + ? O₂ ➔ CO₂ + 2H₂O?',
            options: ['1', '2', '3', '4'],
            correct: 1,
            explanation: 'Carbon requires 2 O atoms (in CO₂) and 4 Hydrogen need 2 O atoms (in 2H₂O), totaling 4 O atoms = 2 O₂.'
        },
        {
            category: 'Reactions',
            question: 'What type of chemical reaction is: 2H₂ + O₂ ➔ 2H₂O?',
            options: ['Combustion / Synthesis', 'Decomposition', 'Single Displacement', 'Double Displacement'],
            correct: 0,
            explanation: 'Two elements combine into a single compound while releasing thermal energy, representing synthesis and combustion.'
        },
        {
            category: 'Reactions',
            question: 'What are the products of an acid-base neutralization between HCl and NaOH?',
            options: ['NaCl + H₂O', 'Na₂O + Cl₂', 'NaClO + H₂', 'NaOH + Cl₂'],
            correct: 0,
            explanation: 'Hydrochloric acid reacts with sodium hydroxide to yield sodium chloride (table salt) and water.'
        },
        {
            category: 'Reactions',
            question: 'What gas is evolved when calcium carbonate (CaCO₃) undergoes thermal decomposition?',
            options: ['Oxygen (O₂)', 'Carbon Dioxide (CO₂)', 'Carbon Monoxide (CO)', 'Hydrogen (H₂)'],
            correct: 1,
            explanation: 'CaCO₃ (limestone) breaks down under intense heat into calcium oxide (CaO) and CO₂ gas.'
        }
    ];
    return rxns[Math.floor(Math.random() * rxns.length)];
}

function generateCrystalQuestion() {
    const crystals = [
        {
            category: 'Crystal Lattices',
            question: 'Which crystal structure achieves the maximum atomic packing efficiency of 74%?',
            options: ['Face-Centered Cubic (FCC) / HCP', 'Body-Centered Cubic (BCC)', 'Simple Cubic (SC)', 'Diamond Cubic'],
            correct: 0,
            explanation: 'FCC and HCP close-pack hard spheres to occupy 74.05% of the total unit cell volume.'
        },
        {
            category: 'Crystal Lattices',
            question: 'What is the coordination number of an atom in a Body-Centered Cubic (BCC) lattice (e.g. Iron)?',
            options: ['6', '8', '12', '4'],
            correct: 1,
            explanation: 'In BCC, the center atom touches 8 corner atoms, giving a coordination number of 8.'
        },
        {
            category: 'Crystal Lattices',
            question: 'What is the atomic packing efficiency of a Simple Cubic (SC) lattice?',
            options: ['52.4%', '68.0%', '74.0%', '34.0%'],
            correct: 0,
            explanation: 'Simple cubic is loosely packed with atoms only touching along cube edges: π/6 ≈ 52.4%.'
        },
        {
            category: 'Crystal Lattices',
            question: 'Which crystallographic Miller index plane cuts through all three axes (x, y, z) equally?',
            options: ['(100)', '(110)', '(111)', '(001)'],
            correct: 2,
            explanation: 'The (111) plane intersects the x, y, and z axes at equal unit distances.'
        }
    ];
    return crystals[Math.floor(Math.random() * crystals.length)];
}

const staticCuratedQuestions = [
    {
        category: 'Elements & Symbols',
        question: 'What is the chemical symbol for Gold?',
        options: ['Ag', 'Au', 'Fe', 'Gd'],
        correct: 1,
        explanation: 'Au comes from the Latin word "Aurum", meaning shining dawn.'
    },
    {
        category: 'Elements & Symbols',
        question: 'Which element has the atomic number 6?',
        options: ['Nitrogen', 'Oxygen', 'Carbon', 'Boron'],
        correct: 2,
        explanation: 'Carbon has Z=6 and forms the structural backbone of organic chemistry.'
    },
    {
        category: 'Isotopes & Nuclear',
        question: 'What is the half-life of Carbon-14 used in radiocarbon dating?',
        options: ['5,730 years', '12.3 years', '24,100 years', '1.2 billion years'],
        correct: 0,
        explanation: 'Carbon-14 decays via Beta-minus with a half-life of 5,730 years.'
    },
    {
        category: 'Reactions',
        question: 'What is the chemical formula for Sodium Bicarbonate (Baking Soda)?',
        options: ['NaCl', 'NaOH', 'NaHCO3', 'Na2CO3'],
        correct: 2,
        explanation: 'NaHCO3 reacts with acid to produce carbon dioxide gas in baking.'
    },
    {
        category: 'Periodic Trends',
        question: 'Which element is the most electronegative on the Pauling scale?',
        options: ['Oxygen', 'Chlorine', 'Fluorine', 'Helium'],
        correct: 2,
        explanation: 'Fluorine has the highest electronegativity value of 3.98.'
    }
];
