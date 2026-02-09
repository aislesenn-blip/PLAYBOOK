// --- CONFIGURATION ---
const BACKEND_URL = "https://ehabakukkkk-demo.hf.space"; // WEKA LINK YAKO HAPA

// --- DOM ELEMENTS ---
const landingPage = document.getElementById('landing-page');
const cockpit = document.getElementById('cockpit-interface');
const orb = document.getElementById('orb');
const panels = {
    chat: document.getElementById('chat-panel'),
    logs: document.getElementById('logs-panel'),
    tasks: document.getElementById('tasks-panel'),
    hardware: document.getElementById('hardware-panel'),
    upload: document.getElementById('upload-panel'),
    training: document.getElementById('training-panel'),
    canvas: document.getElementById('canvas-panel')
};

let recognition;
let isSpeaking = false;
let systemInitialized = false;

// --- 1. ACTIVATION LOGIC (The Reveal) ---
function startSystem() {
    // Check browser support
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        alert("Browser does not support Voice. Please use Chrome.");
        return;
    }

    // Initialize Voice
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => console.log("Listening for trigger...");
    
    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();
        console.log("Heard:", command);

        // THE TRIGGER PHRASE
        if (!systemInitialized && command.includes("call you playbook")) {
            activatePlaybook();
        } else if (systemInitialized) {
            sendToBrain(command); // Send normal commands to brain
        }
    };

    recognition.start();
    document.getElementById('init-btn').innerText = "LISTENING...";
    document.getElementById('init-btn').style.background = "#007aff";
    document.getElementById('init-btn').style.color = "white";
}

function activatePlaybook() {
    systemInitialized = true;
    
    // 1. Fade out Landing
    landingPage.style.opacity = '0';
    
    // 2. Play Sound (Optional - synthesized)
    speak("Identity confirmed. Systems Online.");

    // 3. Show Cockpit after fade
    setTimeout(() => {
        landingPage.style.display = 'none';
        cockpit.classList.add('active');
        // Initial Panel Animation
        panels.logs.classList.add('visible');
    }, 1500);
}

// --- 2. BRAIN COMMUNICATION (API) ---
async function sendToBrain(text) {
    if (!text.trim()) return;
    
    updateLogs(`USER: ${text}`);
    orb.setAttribute('data-state', 'processing');

    try {
        const res = await fetch(`${BACKEND_URL}/interact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_input: text })
        });
        const data = await res.json();

        // Handle UI Commands from Brain
        if (data.ui_control && data.ui_control.toggle_panels) {
            data.ui_control.toggle_panels.forEach(p => {
                if (panels[p]) panels[p].classList.toggle('visible');
            });
        }

        // Handle Confirmation
        if (data.confirmation_needed) {
            showConfirmation(data.confirmation_needed);
            speak(data.confirmation_needed);
            return;
        }

        // Handle Canvas/Code
        if (data.code_snippet) {
            document.getElementById('code-content').innerText = data.code_snippet;
            panels.canvas.classList.add('visible');
        }

        updateLogs(`SYS: ${data.thought_process}`);
        
        // Speak Response
        if (data.speech) speak(data.speech);
        else { orb.setAttribute('data-state', 'listening'); }

    } catch (e) {
        console.error(e);
        orb.setAttribute('data-state', 'idle');
        speak("Server connection failed. Retrying.");
    }
}

// --- 3. UTILITIES ---
function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Try to get a good voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    if (voice) u.voice = voice;
    u.rate = 1.05;
    
    u.onstart = () => orb.setAttribute('data-state', 'speaking');
    u.onend = () => orb.setAttribute('data-state', 'listening');
    window.speechSynthesis.speak(u);
}

function updateLogs(msg) {
    const logBox = document.getElementById('log-content');
    logBox.innerHTML += `<div>> ${msg}</div>`;
    document.getElementById('logs-panel').scrollTop = logBox.scrollHeight;
}

function sendText() {
    const input = document.getElementById('chat-input');
    sendToBrain(input.value);
    input.value = "";
}

// PWA Service Worker Register
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

// Initial Animation for Orb breathing
orb.setAttribute('data-state', 'idle');
