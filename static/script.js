let totalSeconds = 25 * 60;
let timerInterval = null;
let isRunning = false;
let currentResolvedVideoUrl = ""; // Store video URL separately until requested

// 1. Live Clock
function updateClock() {
    const now = new Date();
    document.getElementById('live-clock').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// 2. Adjustable Timer Logic
function renderTimer() {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    document.getElementById('timer-display').innerText = 
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function adjustTime(minutes) {
    if (isRunning) return;
    let newSeconds = totalSeconds + (minutes * 60);
    if (newSeconds >= 60 && newSeconds <= 180 * 60) {
        totalSeconds = newSeconds;
        renderTimer();
    }
}

function setTimerMinutes(minutes) {
    if (isRunning) return;
    totalSeconds = minutes * 60;
    renderTimer();
}

function toggleTimer() {
    const btn = document.getElementById('btn-start-timer');
    const label = document.getElementById('timer-status-label');
    const timerPanel = document.getElementById('timer-panel-card');
    const editControls = document.getElementById('timer-edit-controls');
    const presetControls = document.getElementById('timer-preset-controls');

    if (!isRunning) {
        isRunning = true;
        btn.innerText = "Pause Session";
        label.innerText = "⚡ Focus Session In Progress (Strict Mode)";
        
        timerPanel.classList.add('minimized');
        editControls.style.display = 'none';
        presetControls.style.display = 'none';

        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                renderTimer();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                btn.innerText = "Start Session";
                label.innerText = "🎉 Session Completed!";
                timerPanel.classList.remove('minimized');
                editControls.style.display = 'flex';
                presetControls.style.display = 'flex';
            }
        }, 1000);
    } else {
        clearInterval(timerInterval);
        isRunning = false;
        btn.innerText = "Resume Session";
        label.innerText = "⏸️ Session Paused";
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    totalSeconds = 25 * 60;
    document.getElementById('btn-start-timer').innerText = "Start Session";
    document.getElementById('timer-status-label').innerText = "Ready to Focus";
    
    const timerPanel = document.getElementById('timer-panel-card');
    timerPanel.classList.remove('minimized');
    document.getElementById('timer-edit-controls').style.display = 'flex';
    document.getElementById('timer-preset-controls').style.display = 'flex';
    renderTimer();
}

// 3. Web Speech API Voice Command Input
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser. Please use Chrome!");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    const micBtn = document.getElementById('mic-btn');
    const micText = document.getElementById('mic-text');
    const micIcon = document.getElementById('mic-icon');

    micBtn.classList.add('listening');
    micText.innerText = "Listening...";
    micIcon.innerText = "🔴";

    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('custom-ai-input').value = transcript;
        askAIDoubt(transcript);
    };

    recognition.onerror = function() {
        micBtn.classList.remove('listening');
        micText.innerText = "Hold to Speak Doubt";
        micIcon.innerText = "🎙️";
    };

    recognition.onend = function() {
        micBtn.classList.remove('listening');
        micText.innerText = "Hold to Speak Doubt";
        micIcon.innerText = "🎙️";
    };
}

// 4. Backend API Integration (Text Answer First, Video Optional)
function submitCustomDoubt() {
    const inputField = document.getElementById('custom-ai-input');
    const queryText = inputField.value.trim();
    if (queryText !== "") {
        askAIDoubt(queryText);
        inputField.value = "";
    }
}

function handleInputKeyPress(event) {
    if (event.key === 'Enter') {
        submitCustomDoubt();
    }
}

async function askAIDoubt(topic) {
    const aiOutput = document.getElementById('ai-insights-content');
    aiOutput.innerHTML = `<p><strong>🤖 AI Query:</strong> "${topic}"</p><p style="color: #00d2ff;">Thinking...</p>`;

    try {
        const response = await fetch('/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: topic })
        });

        const data = await response.json();
        currentResolvedVideoUrl = data.video_url; // Save URL for when user explicitly requests it

        // Display ONLY the text answer and an optional button to open video
        aiOutput.innerHTML = `
            <p><strong>🤖 AI Answer:</strong></p>
            <p style="margin-top: 6px; line-height: 1.5; color: #f0f4f8;">${data.answer}</p>
            <div style="margin-top: 12px;">
                <button class="nav-item btn-watch-video" onclick="openVideoExplicitly('${data.query}')">▶ Watch Video Solution</button>
            </div>
        `;

    } catch (err) {
        aiOutput.innerHTML = `<p style="color: #ff4444;">Error communicating with Flask backend API.</p>`;
    }
}

// Opens video ONLY when user explicitly clicks the button
function openVideoExplicitly(query) {
    const videoBox = document.getElementById('video-player-box');
    const iframe = document.getElementById('focus-iframe');
    const videoTitle = document.getElementById('video-title');

    videoTitle.innerText = `Focus TV Stream: ${query}`;
    iframe.src = currentResolvedVideoUrl + "?autoplay=1";
    videoBox.style.display = "flex";
}

function closeVideo() {
    const videoBox = document.getElementById('video-player-box');
    const iframe = document.getElementById('focus-iframe');
    iframe.src = "";
    videoBox.style.display = "none";
}

renderTimer();

// 5. D-Pad Keyboard Navigation Engine
document.addEventListener('DOMContentLoaded', () => {
    const focusables = Array.from(document.querySelectorAll('.nav-item'));
    let currentIndex = 0;

    if (focusables.length > 0) {
        focusables[0].focus();
        focusables[0].classList.add('focused');
    }

    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (document.activeElement.id === 'custom-ai-input') {
                return;
            }

            e.preventDefault();
            focusables[currentIndex].classList.remove('focused');

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                currentIndex = (currentIndex + 1) % focusables.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                currentIndex = (currentIndex - 1 + focusables.length) % focusables.length;
            }

            focusables[currentIndex].focus();
            focusables[currentIndex].classList.add('focused');
        }
    });
});