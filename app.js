const $ = (selector) => document.querySelector(selector);

const setupView = $("#setupView");
const quizView = $("#quizView");
const resultView = $("#resultView");
const setupError = $("#setupError");
const globalError = $("#globalError");
const listSelect = $("#listSelect");
const questionCountInput = $("#questionCount");
const startButton = $("#startButton");
const answerForm = $("#answerForm");
const answerInput = $("#answerInput");
const checkButton = $("#checkButton");
const skipButton = $("#skipButton");
const nextButton = $("#nextButton");

let allWords = [];
let questions = [];
let index = 0;
let score = 0;
let language = 0;
let review = [];
let answered = false;

function showView(view) {
  [setupView, quizView, resultView].forEach((item) => item.classList.add("hidden"));
  view.classList.remove("hidden");
}
function normalize(text) {
  return String(text ?? "").trim().toLocaleLowerCase("hu-HU").replace(/\s+/g, " ");
}
function showSetupError(message = "") {
  setupError.textContent = message;
}
function showGlobalError(message = "") {
  globalError.textContent = message;
}
function parseWordFile(text) {
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, lineIndex) => {
      const parts = line.split("\t");
      if (parts.length < 2) {
        throw new Error(`A szólista ${lineIndex + 1}. sora nem tartalmaz tabulátorral elválasztott két mezőt.`);
      }
      return [parts[0].trim(), parts.slice(1).join("\t").trim()];
    })
    .filter(([first, second]) => first && second);
}
async function loadWordList() {
  showGlobalError("");
  $("#wordCount").textContent = "Szólista betöltése…";
  try {
    const response = await fetch(listSelect.value);
    if (!response.ok) throw new Error(`A szólista nem tölthető be (${response.status}).`);
    allWords = parseWordFile(await response.text());
    $("#wordCount").textContent = `A szólistában ${allWords.length} szó van.`;
    questionCountInput.max = String(allWords.length);
    questionCountInput.value = String(Math.min(10, allWords.length) || 1);
  } catch (error) {
    allWords = [];
    $("#wordCount").textContent = "Nem sikerült betölteni a szólistát.";
    showGlobalError(error.message + " Helyi teszteléshez indíts egy egyszerű helyi webszervert, vagy tedd közzé GitHub Pagesen.");
  }
}
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function startQuiz() {
  showSetupError("");
  showGlobalError("");
  if (!allWords.length) {
    showSetupError("Előbb tölts be egy érvényes szólistát.");
    return;
  }
  const count = Number(questionCountInput.value);
  if (!Number.isInteger(count) || count < 1) {
    showSetupError("Adj meg legalább 1 szót.");
    return;
  }
  if (count > allWords.length) {
    showSetupError(`Legfeljebb ${allWords.length} szót kérhetsz le, mert ennyi van a szólistában.`);
    return;
  }
  language = Number(document.querySelector('input[name="language"]:checked').value);
  questions = shuffle(allWords).slice(0, count);
  index = 0;
  score = 0;
  review = [];
  showView(quizView);
  renderQuestion();
}
function renderQuestion() {
  if (index >= questions.length) {
    showResults();
    return;
  }
  answered = false;
  const pair = questions[index];
  $("#directionText").textContent = language === 0 ? "ANGOL → MAGYAR" : "MAGYAR → ANGOL";
  $("#questionTitle").textContent = pair[language];
  $("#progressText").textContent = `${index + 1} / ${questions.length}`;
  $("#scoreText").textContent = `Pontszám: ${score}`;
  $("#progressFill").style.width = `${(index / questions.length) * 100}%`;
  $("#feedback").textContent = "";
  $("#feedback").className = "feedback";
  answerInput.value = "";
  answerInput.disabled = false;
  checkButton.disabled = false;
  checkButton.textContent = "✓ Ellenőrzés";
  nextButton.classList.add("hidden");
  answerForm.classList.remove("hidden");
  skipButton.classList.remove("hidden");
  answerInput.focus();
}
function checkAnswer(event) {
  event.preventDefault();
  if (answered) return;
  const answer = answerInput.value.trim();
  if (!answer) {
    answerInput.focus();
    return;
  }
  const pair = questions[index];
  const correctAnswer = pair[1 - language];
  const isCorrect = normalize(answer) === normalize(correctAnswer);
  answered = true;
  answerInput.disabled = true;
  checkButton.disabled = true;
  skipButton.classList.add("hidden");
  if (isCorrect) {
    score++;
    $("#feedback").textContent = "Helyes válasz! 🎉";
    $("#feedback").className = "feedback good";
  } else {
    $("#feedback").textContent = `Helytelen válasz. A helyes válasz: ${correctAnswer}`;
    $("#feedback").className = "feedback bad";
    review.push({ question: pair[language], answer: correctAnswer, skipped: false });
  }
  $("#scoreText").textContent = `Pontszám: ${score}`;
  nextButton.textContent = index === questions.length - 1 ? "Eredmény megtekintése →" : "Következő szó →";
  nextButton.classList.remove("hidden");
  nextButton.focus();
}
function skipQuestion() {
  if (answered) return;
  const pair = questions[index];
  review.push({ question: pair[language], answer: pair[1 - language], skipped: true });
  answered = true;
  answerInput.disabled = true;
  checkButton.disabled = true;
  skipButton.classList.add("hidden");
  $("#feedback").textContent = `Kihagytad. A helyes válasz: ${pair[1 - language]}`;
  $("#feedback").className = "feedback bad";
  nextButton.textContent = index === questions.length - 1 ? "Eredmény megtekintése →" : "Következő szó →";
  nextButton.classList.remove("hidden");
  nextButton.focus();
}
function nextQuestion() {
  if (!answered) return;
  index++;
  renderQuestion();
}
function showResults() {
  showView(resultView);
  const asked = questions.length;
  $("#correctStat").textContent = `${score} / ${asked}`;
  $("#percentStat").textContent = `${Math.round((score / asked) * 100)}%`;
  $("#missedStat").textContent = String(review.length);
  $("#progressFill").style.width = "100%";
  const reviewList = $("#reviewList");
  reviewList.replaceChildren();
  if (!review.length) {
    const message = document.createElement("p");
    message.textContent = "Minden válasz helyes volt. Remek munka!";
    message.className = "feedback good";
    reviewList.append(message);
    return;
  }
  review.forEach((item) => {
    const row = document.createElement("div");
    row.className = "review-item";
    const question = document.createElement("span");
    question.textContent = `${item.skipped ? "Kihagyva" : "Hibás"}: ${item.question}`;
    const answer = document.createElement("strong");
    answer.textContent = `Helyes válasz: ${item.answer}`;
    row.append(question, answer);
    reviewList.append(row);
  });
}
startButton.addEventListener("click", startQuiz);
answerForm.addEventListener("submit", checkAnswer);
skipButton.addEventListener("click", skipQuestion);
nextButton.addEventListener("click", nextQuestion);
$("#restartButton").addEventListener("click", () => {
  showView(setupView);
  showSetupError("");
});
listSelect.addEventListener("change", loadWordList);

loadWordList();
