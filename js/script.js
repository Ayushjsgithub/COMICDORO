let time = 1500; // 25 minutes default
let timer;
let running = false;
let isBreak = false;
let quoteInterval;
let pomodoroCount = 0;
let isIdle = true;

const display = document.getElementById("timer");
const toggleBtn = document.getElementById("start-pause");
const reset = document.getElementById("reset");
const customTimeInput = document.getElementById("custom-time");
const speech = document.querySelector(".speech-bubble");
const clockBox = document.querySelector(".clock-box");
const quotes = [
    "“The future depends on what you do today.” — Mahatma Gandhi 🌱",
    "“Do not wait; the time will never be ‘just right.’ Start where you stand.” — Napoleon Hill ⏳",
    "“Success is the sum of small efforts, repeated day in and day out.” — Robert Collier 🔁",
    "“Amateurs sit and wait for inspiration, the rest of us just get up and go to work.” — Stephen King 💼",
    "“The best way out is always through.” — Robert Frost 🚪➡️",
    "“You don't have to be extreme, just consistent.” — Unknown ⚖️",
    "“Discipline is choosing between what you want now and what you want most.” — Abraham Lincoln 🎯",
    "“The only way to do great work is to love what you do.” — Steve Jobs ❤️💻",
    "“Start where you are. Use what you have. Do what you can.” — Arthur Ashe 🧰",
    "“Don’t count the days. Make the days count.” — Muhammad Ali 🥊📆",
    "“We are what we repeatedly do. Excellence, then, is not an act but a habit.” — Aristotle 🔄✨",
    "“Sometimes later becomes never. Do it now.” — Unknown ⏱️🚀",
    "“Action is the foundational key to all success.” — Pablo Picasso 🎨🔑",
    "“What you get by achieving your goals is not as important as what you become by achieving your goals.” — Zig Ziglar 🛤️🌟",
    "“He who has a why to live can bear almost any how.” — Friedrich Nietzsche 💭🛡️",
    "“It always seems impossible until it’s done.” — Nelson Mandela 🧗‍♂️✔️",
    "“Your time is limited, so don’t waste it living someone else’s life.” — Steve Jobs ⏳🚫🎭",
    "“In the middle of every difficulty lies opportunity.” — Albert Einstein 🌪️💡"
];

const fullscreenIcon = document.getElementById("fullscreen-icon");

const quoteBox = document.getElementById("quote-popup");

function updateTimer() {
    const min = String(Math.floor(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    display.textContent = `${min}:${sec}`;
}

//Quote Logic
function startQuoteRotation() {
    if (quoteInterval) clearInterval(quoteInterval);

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

    showQuote(); // show first quote immediately
    quoteInterval = setInterval(showQuote, 20000);
}


function updateToggleButton() {
    toggleBtn.textContent = running ? "Pause" : "Start";
}


function startTimer() {
    if (!running) {
        isIdle = false;
        clockBox.classList.add("running")

        startQuoteRotation();


        timer = setInterval(() => {
            if (time > 0) {
                time--;
                updateTimer();
            } else {
                clearInterval(timer);
                running = false;
                updateToggleButton();

                if (!isBreak) {
                    pomodoroCount++;
                    document.getElementById("count").textContent = pomodoroCount;
                    showSparkle()
                    // End of work session
                    isBreak = true;
                    time = 300; // 5-minute break
                    updateTimer();
                    speech.textContent = "Break time, champ! 🎉";
                    startTimer(); // start break timer automatically
                } else {
                    // End of break
                    isBreak = false;
                    time = 1500; // Reset to default work timer
                    updateTimer();
                    speech.textContent = "Back to work! 💪";
                }
            }
        }, 1000);
        running = true;
        updateToggleButton();
    }
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
    clearInterval(quoteInterval);
    isBreak = false;
    time = 1500;
    isIdle = true;
    updateTimer();
    speech.textContent = "Time to power up and focus! 💥";
    updateToggleButton();
    clockBox.classList.remove("running");
}

function showSparkle() {
    const sparkle = document.getElementById('sparkle-animation');
    sparkle.classList.remove('sparkle');
    void sparkle.offsetWidth;
    sparkle.classList.add('sparkle');
}


// Timer logic
const timerEl = document.getElementById("timer");

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
    let totalSeconds;

    timerEl.removeAttribute("contenteditable");

    if (!isIdle) {
        updateTimer(); // restore original time
        return;
    }

    if (running || isBreak) return;

    if (input.includes(":")) {
        // Format: mm:ss
        const parts = input.split(":");
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);

        const validMinutes = !isNaN(minutes) && minutes >= 0 && minutes <= 999;
        const validSeconds = !isNaN(seconds) && seconds >= 0 && seconds < 60;

        if (parts.length !== 2 || !validMinutes || !validSeconds) {
            alert("Please use mm:ss format (e.g. 25:00)");
            updateTimer();
            return;
        }

        totalSeconds = minutes * 60 + seconds;

    } else {
        // Format: just minutes
        const minutes = parseInt(input, 10);
        if (isNaN(minutes) || minutes < 0 || minutes > 999) {
            alert("Please enter a number between 1 and 999 (minutes)");
            updateTimer();
            return;
        }

        totalSeconds = minutes * 60;
    }

    if (totalSeconds <= 0 || totalSeconds > 7200) {
        alert("Time must be between 1 second and 120 minutes");
        updateTimer();
        return;
    }

    pauseTimer();
    isBreak = false;
    time = totalSeconds;
    updateTimer();
    speech.textContent = `You're set for ${Math.floor(time / 60)} mins! 💥`;
    timerEl.removeAttribute("contenteditable");
});


toggleBtn.addEventListener("click", () => {
    if (running) {
        pauseTimer();
    } else {
        startTimer();
    }
});

reset.addEventListener("click", resetTimer);

updateTimer();
updateToggleButton();


fullscreenIcon.addEventListener("click", () => {
    const doc = document;
    const elem = doc.documentElement;

    if (!doc.fullscreenElement && elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            alert(`Error enabling fullscreen: ${err.message}`);
        });
    } else if (doc.exitFullscreen) {
        doc.exitFullscreen();
    }
});


//Fullscreen mode 
document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
        fullscreenIcon.textContent = "🗗";
    } else {
        fullscreenIcon.textContent = "⛶";
    }
});


document.addEventListener("keydown", (e) => {

    const isEditing = timerEl.getAttribute("contenteditable") === "true";

    if (
        (e.target.tagName === "INPUT" || e.target.isContentEditable) &&
        !(e.key.toLowerCase() === "e" && isIdle && !running)
    ) {
        return;
    }

    switch (e.key.toLowerCase()) {
        case " ": // Start/Pause
        case "spacebar":
            e.preventDefault();
            if (running) {
                pauseTimer();
            } else {
                startTimer();
            }
            break;

        case "r": // Reset
            resetTimer();
            break;

        case "f": // Fullscreen
            fullscreenIcon.click();
            break;

        case "e": // Edit
            e.preventDefault(); // Block typing 'e'

            if (!isIdle || running) return;

            if (isEditing) {
                timerEl.removeAttribute("contenteditable");
                timerEl.blur();
            } else {
                timerEl.setAttribute("contenteditable", "true");


                setTimeout(() => {
                    timerEl.focus();
                }, 0);
            }
            break;
    }
});

