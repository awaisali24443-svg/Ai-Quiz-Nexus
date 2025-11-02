import { dom } from './dom.js';

let audioCtx;

export function initAudio() {
    document.body.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }, { once: true });
}

export function showToast(message, isError = false, isAchievement = false) {
    const toast = document.createElement('div');
    let classes = 'toast';
    if (isError) classes += ' error';
    if (isAchievement) classes += ' achievement';
    
    toast.className = classes;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 4000);
}

export function showLoading(show, text = 'Loading...') {
    dom.loadingOverlay.classList.toggle('hidden', !show);
    dom.loadingText.textContent = text;
}

export function playSound(type) {
    if (!audioCtx || audioCtx.state === 'suspended') {
        if(audioCtx) audioCtx.resume();
        else return;
    }
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    switch (type) {
        case 'correct':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
            break;
        case 'incorrect':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(164.81, audioCtx.currentTime); // E3
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
            break;
        case 'click':
        default:
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
            break;
    }
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
}