// scientific calculator
let currentExpression = '';
let displayExpression = '';
const historyEl = document.getElementById('history');
const resultEl = document.getElementById('result');

function updateDisplay() {
    resultEl.innerText = displayExpression || '0';
    
    // Adjust font size based on length
    if (displayExpression.length > 15) {
        resultEl.classList.add('very-long');
        resultEl.classList.remove('long');
    } else if (displayExpression.length > 9) {
        resultEl.classList.add('long');
        resultEl.classList.remove('very-long');
    } else {
        resultEl.classList.remove('long', 'very-long');
    }
}

function appendValue(value, displayVal = value) {
    // Basic formatting for factorial
    if (value === '!') {
        currentExpression += '!';
        displayExpression += '!';
    } else {
        currentExpression += value;
        displayExpression += displayVal;
    }
    updateDisplay();
}

function appendFunction(funcName) {
    currentExpression += 'Math.' + funcName;
    displayExpression += funcName;
    updateDisplay();
}

function clearDisplay() {
    currentExpression = '';
    displayExpression = '';
    historyEl.innerText = '';
    updateDisplay();
}

function deleteChar() {
    if (currentExpression.length > 0) {
        // Simple deletion, might not perfectly handle Math.sin( if deleted character by character
        // A robust implementation would parse tokens, but for now we do simple string manipulation
        if (currentExpression.endsWith('Math.PI')) {
            currentExpression = currentExpression.slice(0, -7);
            displayExpression = displayExpression.slice(0, -1);
        } else if (currentExpression.endsWith('Math.E')) {
            currentExpression = currentExpression.slice(0, -6);
            displayExpression = displayExpression.slice(0, -1);
        } else if (currentExpression.match(/Math\.[a-z]{2,4}\($/)) {
            let match = currentExpression.match(/Math\.([a-z]{2,4})\($/);
            currentExpression = currentExpression.replace(/Math\.[a-z]{2,4}\($/, '');
            displayExpression = displayExpression.replace(new RegExp(match[1] + '\\($'), '');
        } else {
            currentExpression = currentExpression.slice(0, -1);
            displayExpression = displayExpression.slice(0, -1);
        }
    }
    updateDisplay();
}

// Custom factorial function for eval
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function degSin(degrees) {
    return Math.sin(toRadians(degrees));
}

function degCos(degrees) {
    return Math.cos(toRadians(degrees));
}

function degTan(degrees) {
    // Handle undefined for 90, 270, etc. due to floating point precision
    if (degrees % 180 === 90 || degrees % 180 === -90) {
        return NaN; // Tan 90 is undefined
    }
    return Math.tan(toRadians(degrees));
}

function calculate() {
    if (!currentExpression) return;
    
    try {
        let evalExpression = currentExpression;

        // Auto-close missing parentheses for ease of use
        let openParens = (evalExpression.match(/\(/g) || []).length;
        let closeParens = (evalExpression.match(/\)/g) || []).length;
        while (openParens > closeParens) {
            evalExpression += ')';
            displayExpression += ')';
            closeParens++;
        }

        historyEl.innerText = displayExpression + ' =';
        
        // Handle factorial replacement: e.g., 5! -> factorial(5)
        evalExpression = evalExpression.replace(/(\d+)!/g, 'factorial($1)');
        
        // Handle log (base 10) and ln (base e)
        // Math.log in JS is base e (ln). Math.log10 is base 10 (log).
        evalExpression = evalExpression.replace(/Math\.log\(/g, 'Math.log10(');
        evalExpression = evalExpression.replace(/Math\.ln\(/g, 'Math.log(');

        // Convert trigonometric functions to use degrees
        evalExpression = evalExpression.replace(/Math\.sin\(/g, 'degSin(');
        evalExpression = evalExpression.replace(/Math\.cos\(/g, 'degCos(');
        evalExpression = evalExpression.replace(/Math\.tan\(/g, 'degTan(');

        let result = eval(evalExpression);
        
        // Handle floating point precision issues and format like a standard scientific calculator
        // Round to 10 decimal places and remove trailing zeros
        if (typeof result === 'number' && !isNaN(result)) {
            result = parseFloat(result.toFixed(10));
        }
        
        displayExpression = result.toString();
        currentExpression = result.toString();
        updateDisplay();
    } catch (error) {
        displayExpression = 'Error';
        currentExpression = '';
        updateDisplay();
        setTimeout(clearDisplay, 1500);
    }
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/[0-9.]/.test(key)) {
        appendValue(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendValue(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        deleteChar();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === '(' || key === ')') {
        appendValue(key);
    } else if (key === '^') {
        appendValue('**', '^');
    }
});
