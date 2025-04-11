import * as monaco from 'monaco-editor';
import * as ts from 'typescript';

const storedFontSize = parseInt(localStorage.getItem('editorFontSize')) || 14;
const storedConsoleHeight = localStorage.getItem('consoleHeight') || '30%';
let fontSize = storedFontSize;
let currentLanguage = localStorage.getItem('editorLanguage') || 'javascript';

const editor = monaco.editor.create(document.getElementById('editor'), {
    value: localStorage.getItem('editorContent') || `console.log("Hello, world!");`,
    language: currentLanguage,
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: fontSize,
    lineNumbersMinChars: 3
});

const logDiv = document.getElementById('console');
logDiv.style.flex = `0 0 ${storedConsoleHeight}`;

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.ESNext,
    noEmit: true,
    typeRoots: ["node_modules/@types"]
});

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
});

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
        let code = editor.getValue();
        if(currentLanguage === 'typescript') {
            code = ts.transpileModule(code, {
                compilerOptions: {
                    target: ts.ScriptTarget.ESNext,
                    module: ts.ModuleKind.ESNext
                }
            }).outputText;
        }
        new Function(code)();
    } catch (err) {
        console.log('Error:', err.message);
    }
};

window.clearConsole = function() {
    logDiv.innerHTML = '';
};

window.switchLanguage = function(lang) {
    currentLanguage = lang;
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, lang);
    localStorage.setItem('editorLanguage', lang);
    localStorage.setItem('editorContent', editor.getValue());
};

window.changeFontSize = function(delta) {
    fontSize = Math.min(Math.max(fontSize + delta, 8), 24);
    editor.updateOptions({ fontSize: fontSize });
    localStorage.setItem('editorFontSize', fontSize);
};

const resizer = document.getElementById('resizer');
let isResizing = false;

resizer.addEventListener('mousedown', startResize);
document.addEventListener('mousemove', resize);
document.addEventListener('mouseup', stopResize);

function startResize() {
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

window.addEventListener('load', () => {
    document.getElementById('languageSelect').value = currentLanguage;
    if (storedConsoleHeight) {
        logDiv.style.flex = `0 0 ${storedConsoleHeight}`;
    }
});