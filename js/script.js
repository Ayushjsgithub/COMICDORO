// Constants
const DEFAULT_WORK_TIME = 1500; // 25 mins
const DEFAULT_BREAK_TIME = 300; // 5 mins
const MAX_TIME = 7200;
const MIN_TIME = 1;

// State
let time = DEFAULT_WORK_TIME;
let timer, quoteInterval;
let running = false;
let isBreak = false;
let isIdle = true;
let pomodoroCount = 0;

// DOM Elements
const display = document.getElementById("timer");
const toggleBtn = document.getElementById("start-pause");
const resetBtn = document.getElementById("reset");
const customTimeInput = document.getElementById("custom-time");
const speech = document.querySelector(".speech-bubble");
const clockBox = document.querySelector(".clock-box");
const quoteBox = document.getElementById("quote-popup");
const fullscreenIcon = document.getElementById("fullscreen-icon");
const timerEl = document.getElementById("timer");

// Data
const quotes = [];
const celebrationSounds = [
    "../assets/audios/sparkle 1.mp3",
    "../assets/audios/sparkle 2.mp3",
    "../assets/audios/sparkle 3.mp3",
    "../assets/audios/sparkle 4.mp3",
    "../assets/audios/sparkle 5.mp3"
].map(path => new Audio(path));

// ------------------------- Timer Functions -------------------------

function updateTimer() {
    const min = String(Math.floor(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    display.textContent = `${min}:${sec}`;
}

function updateToggleButton() {
    toggleBtn.textContent = running ? "Pause" : "Start";
}

function startTimer() {
    if (running) return;

    isIdle = false;
    running = true;
    clockBox.classList.add("running");
    updateToggleButton();
    startQuoteRotation();

    timer = setInterval(() => {
        if (time > 0) {
            time--;
            clockBox.classList.toggle("pulse-warning", time <= 5 && time > 0);
            updateTimer();
        } else {
            handleSessionEnd();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    clearInterval(quoteInterval);
    running = false;
    clockBox.classList.remove("running");
    updateToggleButton();
}

function resetTimer() {
    pauseTimer();
    isBreak = false;
    isIdle = true;
    time = DEFAULT_WORK_TIME;
    speech.textContent = "Time to power up and focus! 💥";
    updateTimer();
}

// ------------------------- Session Handling -------------------------

function handleSessionEnd() {
    clearInterval(timer);
    running = false;
    updateToggleButton();
    clockBox.classList.remove("pulse-warning");

    if (!isBreak) {
        pomodoroCount++;
        document.getElementById("count").textContent = pomodoroCount;
        speech.textContent = "Break time, champ! 🎉";
        isBreak = true;
        time = DEFAULT_BREAK_TIME;
        launchFullPagePopper();
    } else {
        speech.textContent = "Back to work! 💪";
        isBreak = false;
        time = DEFAULT_WORK_TIME;
    }

    updateTimer();
    startTimer();
}

// ------------------------- Quotes -------------------------

function startQuoteRotation() {
    clearInterval(quoteInterval);
    let lastQuote = "";

    const showQuote = () => {
        let quote;
        do {
            quote = quotes[Math.floor(Math.random() * quotes.length)];
        } while (quote === lastQuote);
        lastQuote = quote;

        quoteBox.textContent = quote;
        quoteBox.classList.remove("hidden");
        quoteBox.style.opacity = "1";

        setTimeout(() => {
            quoteBox.style.opacity = "0";
            quoteBox.classList.add("hidden");
        }, 5500);
    };

    showQuote();
    quoteInterval = setInterval(showQuote, 20000);
}

// ------------------------- Confetti Celebration -------------------------

function launchFullPagePopper() {
    const sound = celebrationSounds[Math.floor(Math.random() * celebrationSounds.length)];
    sound.currentTime = 0;
    sound.volume = 0.7 + Math.random() * 0.3;
    sound.play();

    const colors = ["#f94144", "#f3722c", "#f9844a", "#f9c74f", "#90be6d", "#43aa8b", "#577590", "#277da1", "#e76f51", "#264653", "#2a9d8f", "#e9c46a"];
    const animations = ["fall1", "fall2", "fall3", "fall4", "fall5"];

    for (let i = 0; i < 250; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        const isEmoji = Math.random() < 0.1;
        if (isEmoji) {
            confetti.textContent = ["🎉", "🎊", "✨", "🥳"][Math.floor(Math.random() * 4)];
            confetti.style.backgroundColor = "transparent";
            confetti.style.fontSize = `${14 + Math.random() * 20}px`;
        } else {
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        }

        confetti.style.width = `${4 + Math.random() * 6}px`;
        confetti.style.height = `${6 + Math.random() * 10}px`;
        confetti.style.left = `${Math.random() * window.innerWidth}px`;
        confetti.style.top = `${Math.random() * -200}px`;
        confetti.style.setProperty("--x", `${(Math.random() - 0.5) * 600}px`);
        confetti.style.setProperty("--y", `${400 + Math.random() * 400}px`);
        confetti.style.setProperty("--rot", `${Math.floor(Math.random() * 1440)}deg`);
        confetti.style.animationName = animations[Math.floor(Math.random() * animations.length)];
        confetti.style.animationDuration = `${1.5 + Math.random()}s`;
        if (Math.random() < 0.2) confetti.style.filter = "blur(1px)";

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
    }
}

// ------------------------- Editable Timer Input -------------------------

timerEl.addEventListener("click", () => {
    if (!isIdle) {
        timerEl.classList.add("shake");
        setTimeout(() => timerEl.classList.remove("shake"), 300);
        return;
    }
    timerEl.setAttribute("contenteditable", "true");
    timerEl.focus();
});

timerEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        timerEl.blur();
    }
});

timerEl.addEventListener("blur", () => {
    const input = timerEl.textContent.trim();
    timerEl.removeAttribute("contenteditable");

    if (!isIdle || running || isBreak) {
        updateTimer();
        return;
    }

    let totalSeconds = parseTimeInput(input);
    if (totalSeconds === null) {
        alert("Invalid time format.");
        updateTimer();
        return;
    }

    pauseTimer();
    isBreak = false;
    time = totalSeconds;
    speech.textContent = `You're set for ${Math.floor(time / 60)} mins! 💥`;
    updateTimer();
});

function parseTimeInput(input) {
    if (input.includes(":")) {
        const [minStr, secStr] = input.split(":");
        const min = parseInt(minStr, 10);
        const sec = parseInt(secStr, 10);
        if (isNaN(min) || isNaN(sec) || sec >= 60) return null;
        const total = min * 60 + sec;
        return (total >= MIN_TIME && total <= MAX_TIME) ? total : null;
    }

    const min = parseInt(input, 10);
    if (isNaN(min)) return null;
    const total = min * 60;
    return (total >= MIN_TIME && total <= MAX_TIME) ? total : null;
}

// ------------------------- Mouse Wheel Control -------------------------

timerEl.addEventListener("wheel", (e) => {
    if (!isIdle || running || isBreak) return;

    e.preventDefault();
    let delta = e.deltaY < 0 ? 60 : -60;
    if (e.shiftKey) delta *= 5;

    time = Math.min(MAX_TIME, Math.max(MIN_TIME, time + delta));
    updateTimer();
});

// ------------------------- Controls -------------------------

toggleBtn.addEventListener("click", () => running ? pauseTimer() : startTimer());
resetBtn.addEventListener("click", resetTimer);
updateTimer();
updateToggleButton();

// ------------------------- Fullscreen -------------------------

fullscreenIcon.addEventListener("click", () => {
    const doc = document;
    const elem = doc.documentElement;

    if (!doc.fullscreenElement && elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
    } else {
        doc.exitFullscreen?.();
    }
});

document.addEventListener("fullscreenchange", () => {
    fullscreenIcon.textContent = document.fullscreenElement ? "🗗" : "⛶";
});

// ------------------------- Keyboard Shortcuts -------------------------

document.addEventListener("keydown", (e) => {
    if ((e.target.tagName === "INPUT" || e.target.isContentEditable) && e.key.toLowerCase() !== "e") return;

    switch (e.key.toLowerCase()) {
        case " ":
        case "spacebar":
            e.preventDefault();
            running ? pauseTimer() : startTimer();
            break;
        case "r":
            resetTimer();
            break;
        case "f":
            fullscreenIcon.click();
            break;
        case "e":
            e.preventDefault();
            if (!isIdle || running) return;
            const isEditing = timerEl.getAttribute("contenteditable") === "true";
            if (isEditing) {
                timerEl.removeAttribute("contenteditable");
                timerEl.blur();
            } else {
                timerEl.setAttribute("contenteditable", "true");
                setTimeout(() => timerEl.focus(), 0);
            }
            break;
    }
});

// ------------------------- Info Toggle -------------------------

document.addEventListener("DOMContentLoaded", () => {
    const infoBtn = document.querySelector(".info-btn");
    const infoContainer = document.querySelector(".info-container");

    infoBtn.addEventListener("click", e => {
        e.stopPropagation();
        infoContainer.classList.toggle("active");
    });

    document.addEventListener("click", e => {
        if (!infoContainer.contains(e.target)) {
            infoContainer.classList.remove("active");
        }
    });
});
