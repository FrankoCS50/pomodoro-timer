let timer;
let isRunning = false;
let isFocusTime = true;
let secondsLeft;
let focusTime = 25 * 60;
let breakTime = 5 * 60;
let longBreakTime = 15 * 60;
let pomodoroCount = 0;

const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const statusText = document.getElementById('statusText');
const endSound = document.getElementById('endSound');
const progressBar = document.getElementById('progress');
const focusDurationInput = document.getElementById('focusDuration');
const breakDurationInput = document.getElementById('breakDuration');
const darkModeButton = document.getElementById('darkModeButton');
const autoStartCheckbox = document.getElementById('autoStart');

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`; // Corrected line
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timer);
        startButton.textContent = 'Start';
        isRunning = false;
    } else {
        secondsLeft = isFocusTime ? focusTime : breakTime;
        timer = setInterval(updateTimer, 1000);
        startButton.textContent = 'Pause';
        isRunning = true;
    }
}

function updateTimer() {
    secondsLeft--;
    updateProgressBar();
    timerDisplay.textContent = formatTime(secondsLeft);
    timerDisplay.setAttribute("aria-label", `Time remaining: ${formatTime(secondsLeft)}`);
    statusText.setAttribute("aria-label", `Current status: ${statusText.textContent}`);

    if (secondsLeft < 0) {
        clearInterval(timer);
        isRunning = false;
        playEndSound();

        isFocusTime = !isFocusTime;

        if (isFocusTime) {
            statusText.textContent = 'Focus Time';
        } else {
            pomodoroCount++;
            if (pomodoroCount >= 4) {
                statusText.textContent = 'Long Break Time';
                secondsLeft = longBreakTime;
                pomodoroCount = 0;
            } else {
                statusText.textContent = 'Break Time';
                secondsLeft = breakTime;
            }
        }
        statusText.setAttribute("aria-label", `Current status: ${statusText.textContent}`);
        secondsLeft = isFocusTime ? focusTime : breakTime;
        timerDisplay.textContent = formatTime(secondsLeft);
        timerDisplay.setAttribute("aria-label", `Time remaining: ${formatTime(secondsLeft)}`);
        updateProgressBar();
        startButton.textContent = 'Start';

        if (autoStartCheckbox.checked) {
            toggleTimer();
        }
    }
}

function updateProgressBar() {
    const totalTime = isFocusTime ? focusTime : breakTime;
    const percentageLeft = (secondsLeft / totalTime) * 100;
    progressBar.style.width = `${Math.max(0, percentageLeft)}%`;
}

function playEndSound() {
    endSound.currentTime = 0;
    endSound.play();
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isFocusTime = true;
    updateCustomTimes({ target: focusDurationInput });
    updateCustomTimes({ target: breakDurationInput });
    secondsLeft = focusTime;
    timerDisplay.textContent = formatTime(secondsLeft);
    timerDisplay.setAttribute("aria-label", `Time remaining: ${formatTime(secondsLeft)}`);
    statusText.setAttribute("aria-label", `Current status: ${statusText.textContent}`);
    updateProgressBar();
    startButton.textContent = 'Start';
    statusText.textContent = 'Focus Time';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    updateDarkModeButtonText();
}

function updateDarkModeButtonText() {
    darkModeButton.textContent = document.body.classList.contains('dark-mode') ? '🌞 Light Mode' : '🌙 Dark Mode';
}

function loadDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeButtonText();
}

function updateCustomTimes(event) {
    let inputField = event.target;
    let inputValue = inputField.value.trim();
    let isValid = true;
    let parsedValue;

    if (inputValue === "" || isNaN(Number(inputValue)) || Number(inputValue) <= 0 || (inputField.id === "focusDuration" && Number(inputValue) > 60) || (inputField.id === "breakDuration" && Number(inputValue) > 30) || !Number.isInteger(Number(inputValue))) {
        isValid = false;
        inputField.classList.add('invalid-input');
        inputField.value = "";
        if (inputField.id === "focusDuration") {
            focusTime = 25 * 60;
        } else {
            breakTime = 5 * 60;
        }
    } else {
        inputField.classList.remove('invalid-input');
        parsedValue = parseInt(inputValue, 10);
        if (inputField.id === "focusDuration") {
            focusTime = parsedValue * 60;
        } else {
            breakTime = parsedValue * 60;
        }
    }

    if (!isRunning) {
        secondsLeft = isFocusTime ? focusTime : breakTime;
        timerDisplay.textContent = formatTime(secondsLeft);
        timerDisplay.setAttribute("aria-label", `Time remaining: ${formatTime(secondsLeft)}`);
        updateProgressBar();
    }
}

focusDurationInput.addEventListener('input', updateCustomTimes);
breakDurationInput.addEventListener('input', updateCustomTimes);
startButton.addEventListener('click', toggleTimer);
resetButton.addEventListener('click', resetTimer);
darkModeButton.addEventListener('click', toggleDarkMode);

focusDurationInput.value = 25;
breakDurationInput.value = 5;

focusDurationInput.dispatchEvent(new Event('input'));
breakDurationInput.dispatchEvent(new Event('input'));

loadDarkModePreference();