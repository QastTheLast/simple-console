import * as monaco from 'monaco-editor';

const storedFontSize = parseInt(localStorage.getItem('editorFontSize')) || 14;
const storedConsoleHeight = localStorage.getItem('consoleHeight') || '30%';

let fontSize = storedFontSize;

const editor = monaco.editor.create(document.getElementById('editor'), {
    value: `console.log("Hello, world!");`,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: fontSize,
    lineNumbersMinChars: 3
});

const logDiv = document.getElementById('console');
logDiv.style.flex = `0 0 ${storedConsoleHeight}`;

const originalLog = console.log;
console.log = (...args) => {
    originalLog(...args);
    const line = document.createElement('div');
    line.textContent = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
    logDiv.appendChild(line);
};

window.runCode = function () {
    logDiv.innerHTML = '';
    try {
        new Function(editor.getValue())();
    } catch (err) {
        console.log('Error:', err.message);
    }
};

window.clearConsole = function() {
    logDiv.innerHTML = '';
};

const resizer = document.getElementById('resizer');
let isResizing = false;

resizer.addEventListener('mousedown', startResize);
document.addEventListener('mousemove', resize);
document.addEventListener('mouseup', stopResize);

function startResize(e) {
    isResizing = true;
    document.body.style.userSelect = 'none';
}

function resize(e) {
    if (!isResizing) return;
    const consoleHeight = document.body.offsetHeight - e.clientY;
    const heightValue = `${Math.max(50, consoleHeight)}px`;
    logDiv.style.flex = `0 0 ${heightValue}`;
    localStorage.setItem('consoleHeight', heightValue);
}


function stopResize() {
    isResizing = false;
    document.body.style.userSelect = '';
}

window.changeFontSize = function(delta) {
    fontSize = Math.min(Math.max(fontSize + delta, 8), 24);
    editor.updateOptions({ fontSize: fontSize });
    localStorage.setItem('editorFontSize', fontSize); // Сохраняем размер
};

window.addEventListener('load', () => {
    if (storedConsoleHeight) {
        logDiv.style.flex = `0 0 ${storedConsoleHeight}`;
    }
});

