// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScore = {
  10: 0,
  25: 0,
  50: 0,
  99: 0,
};
let selectedOption = 0;

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0s";

// Scroll
let valueY = 0;

// store the best score in localstorage
function storeBestScore(score = 0, option) {
  // if the parametre is 0 than the game just loaded and is being played for the first time
  if (bestScore[option] === 0) {
    bestScore = { ...bestScore, [option]: score };
    localStorage.setItem("bestScore", JSON.stringify(bestScore));
  } else {
    if (bestScore[option] > score) {
      bestScore = { ...bestScore, [option]: score };
      localStorage.setItem("bestScore", JSON.stringify(bestScore));
    }
  }
  // updating the scores and storing in the memory
}

// restore bestScore when game is reset or the site is re-visited
function restoreBestScore() {
  // if there is score stored in localStorage then we have to reinstate in the correct locations
  if (localStorage.getItem("bestScore")) {
    bestScore = JSON.parse(localStorage.getItem("bestScore"));
  }
  // if there is a previous best score stored for a particular option then it will be populated
  bestScores.forEach((el) => {
    if (bestScore[el.getAttribute("data-val")] != 0) {
      el.textContent = `${Math.floor(
        bestScore[el.getAttribute("data-val")]
      ).toFixed(1)}s`;
    }
  });
}

// TODO: show the bestscore in the splash screen

// show score page
function showScorePage(finalTime, baseTime, penaltyTime) {
  gamePage.hidden = true;
  scorePage.hidden = false;
  finalTimeEl.textContent = `${Math.floor(finalTime).toFixed(1)}s`;
  baseTimeEl.textContent = `${Math.floor(baseTime).toFixed(1)}s`;
  penaltyTimeEl.textContent = `+${penaltyTime}s`;
  storeBestScore(
    Number(Math.floor(finalTime).toFixed(1)),
    Number(selectedOption)
  );
}

// stop timer, process results, goto scorepage
function checkTime() {
  if (playerGuessArray.length === questionAmount) {
    clearInterval(timer);
    // check for wrong guesses, add penalty tiem
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {
        // correct guess
      } else {
        // incorrect guess, add penalty
        penaltyTime += 0.5;
      }
    });

    finalTime = timePlayed + penaltyTime;
    showScorePage(finalTime, timePlayed, penaltyTime);
  }
}

// add a tenth of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// start timer when game page is clicked
function startTimer() {
  // reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 1000);
  gamePage.removeEventListener("click", startTimer);
}

// scroll, store user selection in playerGuessArray
function select(guessedTrue) {
  // scoll 80 pixels
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // add player guess to array
  guessedTrue ? playerGuessArray.push(true) : playerGuessArray.push(false);
  checkTime();
}

// display game page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// get random number up to a max number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// add equations to DOM
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    // item
    const item = document.createElement("div");
    item.classList.add("item");
    // equation text
    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;
    // append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

// get the value from selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioEl) => {
    if (radioEl.checked) {
      radioValue = radioEl.value;
    }
  });

  return Number(radioValue);
}

// displa 3,2,1,go!
const countdownStart = () => {
  countdown.textContent = 3;
  let counter = 3;
  setInterval(() => {
    if (counter > 0) {
      countdown.textContent = counter;
      counter--;
    } else {
      countdown.textContent = "GO!";
      clearInterval(countdownStart);
    }
  }, 1000);
};

// navigate from splash page to countdown page
function showCountdown() {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  countdownStart();
  populateGamePage();
  setTimeout(showGamePage, 400);
}

// form that decides amount of questons
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (questionAmount) showCountdown();
}

// event listener
startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    // remove selected label styling
    radioEl.classList.remove("selected-label");
    // added the selected  label styling if it is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
      selectedOption = radioEl.children[1].value;
    }
  });
});

startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);
restoreBestScore();
