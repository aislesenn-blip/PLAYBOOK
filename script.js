lucide.createIcons();

// *** MUHIMU: WEKA URL YAKO YA HUGGING FACE HAPA ***
const BRAIN_URL = "https://ehabakukkkk-playbook-brain.hf.space"; 

const landingPage = document.getElementById('landing-page');
const systemUI = document.getElementById('system-ui');
const chatInput = document.getElementById('chat-input');
const logContent = document.getElementById('log-content');

function log(msg) {
    logContent.innerHTML += `<div>> ${msg}</div>`;
    document.getElementById('logs-panel').scrollTop = document.getElementById('logs-panel').scrollHeight;
}

// 1. WAKE SYSTEM (Transition)
function wakeSystem() {
    landingPage.style.transform = "translateY(-100%)";
    setTimeout(() => {
        systemUI.style.display = "block";
        setTimeout(() => systemUI.classList.add('active'), 100);
        log("PLAYBOOK CORE ONLINE");
        speak("System initialized. I am Playbook. Standing by for Ernest.");
    }, 800);
}

// 2. BRAIN INTERACTION
async function handleInput() {
    const text = chatInput.value;
    if(!text) return;
    
    log(`USER: ${text}`);
    chatInput.value = "";
    
    try {
        const response = await fetch(`${BRAIN_URL}/interact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_input: text })
        });
        
        const data = await response.json();
        
        // Handle Code Generation
        if(data.code_snippet) {
            document.getElementById('code-display').innerText = data.code_snippet;
            document.getElementById('canvas-panel').classList.add('visible');
            log("SYS: Code generated in Canvas.");
        }
        
        // Handle UI Controls (Moving panels etc)
        if(data.ui_control && data.ui_control.toggle_panels) {
            data.ui_control.toggle_panels.forEach(p => {
                const el = document.getElementById(`${p}-panel`);
                if(el) el.classList.toggle('visible');
            });
        }

        if(data.speech) speak(data.speech);
        if(data.thought_process) log(`THOUGHT: ${data.thought_process}`);

    } catch (e) {
        log("ERROR: Connection to Brain lost.");
        speak("Brain offline. Check Hugging Face status.");
    }
}

// 3. VOICE ENGINE
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 1;
    window.speechSynthesis.speak(msg);
}

function toggleCanvas(show) {
    document.getElementById('canvas-panel').classList.toggle('visible', show);
}

chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleInput(); });
