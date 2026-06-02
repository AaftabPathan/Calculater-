/* ==========================================================================
   AETHER CALC - CORE MATH ENGINE & UI LOGIC
   ========================================================================== */

/**
 * --- WEB AUDIO SYNTHESIZER ---
 * Synthesizes click and chime sound effects completely via standard Web Audio API.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  play(type = 'default') {
    if (!this.enabled) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      
      if (type === 'equals') {
        // High-end dual confirmation chime
        this.playChime(523.25, 0.04, now); // C5
        this.playChime(783.99, 0.04, now + 0.08); // G5
      } else if (type === 'operator' || type === 'special') {
        // High frequency transient click
        this.playTap(520, 0.04, now);
      } else {
        // Low frequency transient click
        this.playTap(340, 0.03, now);
      }
    } catch (e) {
      console.warn("Web Audio API not allowed or supported yet:", e);
    }
  }

  playTap(freq, duration, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  playChime(freq, gainVal, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.4);
  }
}

/**
 * --- MATHEMATICAL RECURSIVE DESCENT PARSER ---
 * Parses complex algebraic expressions with functions, constants, operations, and parenthesis.
 * Evaluates with true mathematical operator precedence securely (no eval).
 */
class MathParser {
  constructor(input) {
    // Normalise input for parsing
    this.input = input
      .replace(/\s+/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-'); // Normalise Unicode minus
    this.index = 0;
  }

  peek() {
    return this.index < this.input.length ? this.input[this.index] : null;
  }

  consume(char) {
    if (this.peek() === char) {
      this.index++;
      return true;
    }
    // Auto-close parenthesis at the end of input for enhanced user experience
    if (char === ')' && this.peek() === null) {
      return true;
    }
    return false;
  }

  parse() {
    const value = this.parseExpression();
    if (this.index < this.input.length) {
      throw new Error("Syntax Error");
    }
    return value;
  }

  // E = T (( '+' | '-' ) T)*
  parseExpression() {
    let val = this.parseTerm();
    while (true) {
      if (this.consume('+')) {
        val += this.parseTerm();
      } else if (this.consume('-')) {
        val -= this.parseTerm();
      } else {
        break;
      }
    }
    return val;
  }

  // T = F (( '*' | '/' ) F)*
  parseTerm() {
    let val = this.parseFactor();
    while (true) {
      if (this.consume('*')) {
        val *= this.parseFactor();
      } else if (this.consume('/')) {
        const denom = this.parseFactor();
        if (denom === 0) throw new Error("Div by 0");
        val /= denom;
      } else {
        break;
      }
    }
    return val;
  }

  // F = P ( '^' P )*
  parseFactor() {
    let val = this.parsePrimary();
    while (true) {
      if (this.consume('^')) {
        val = Math.pow(val, this.parsePrimary());
      } else {
        break;
      }
    }
    return val;
  }

  // P = Unary | ScientificFunction | Grouping | Constant | Number
  parsePrimary() {
    if (this.consume('+')) {
      return this.parsePrimary();
    }
    if (this.consume('-')) {
      return -this.parsePrimary();
    }

    let val;

    // Check scientific prefix functions
    if (this.input.startsWith('sin(', this.index)) {
      this.index += 4;
      val = Math.sin(this.parseExpression() * Math.PI / 180); // In degrees
      if (!this.consume(')')) throw new Error("Missing )");
    } else if (this.input.startsWith('cos(', this.index)) {
      this.index += 4;
      val = Math.cos(this.parseExpression() * Math.PI / 180); // In degrees
      if (!this.consume(')')) throw new Error("Missing )");
    } else if (this.input.startsWith('tan(', this.index)) {
      this.index += 4;
      val = Math.tan(this.parseExpression() * Math.PI / 180); // In degrees
      if (!this.consume(')')) throw new Error("Missing )");
    } else if (this.input.startsWith('log(', this.index)) {
      this.index += 4;
      val = Math.log10(this.parseExpression());
      if (!this.consume(')')) throw new Error("Missing )");
    } else if (this.input.startsWith('ln(', this.index)) {
      this.index += 3;
      val = Math.log(this.parseExpression());
      if (!this.consume(')')) throw new Error("Missing )");
    } else if (this.input.startsWith('sqrt(', this.index)) {
      this.index += 5;
      const inner = this.parseExpression();
      if (inner < 0) throw new Error("Imaginary Num");
      val = Math.sqrt(inner);
      if (!this.consume(')')) throw new Error("Missing )");
    } else if (this.consume('(')) {
      val = this.parseExpression();
      if (!this.consume(')')) throw new Error("Missing )");
    } else {
      val = this.parseNumberOrConstant();
    }

    // Postfix operators like Factorial and Percent
    while (true) {
      if (this.consume('!')) {
        val = this.factorial(val);
      } else if (this.consume('%')) {
        val = val * 0.01;
      } else {
        break;
      }
    }

    return val;
  }

  parseNumberOrConstant() {
    if (this.consume('π')) {
      return Math.PI;
    }
    if (this.consume('e')) {
      return Math.E;
    }

    const start = this.index;
    let hasDigit = false;

    // Standard number capture (including floats and scientific e notation e.g. 2e5)
    while (this.index < this.input.length) {
      const char = this.input[this.index];
      if ((char >= '0' && char <= '9') || char === '.') {
        this.index++;
        hasDigit = true;
      } else if (hasDigit && (char === 'e' || char === 'E')) {
        const next = this.input[this.index + 1];
        if (next === '+' || next === '-' || (next >= '0' && next <= '9')) {
          this.index += 2;
          while (this.index < this.input.length && this.input[this.index] >= '0' && this.input[this.index] <= '9') {
            this.index++;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (start === this.index) {
      throw new Error("Syntax Error");
    }

    const numStr = this.input.substring(start, this.index);
    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw new Error("Invalid Number");
    }
    return num;
  }

  factorial(n) {
    if (n < 0 || !Number.isInteger(n)) throw new Error("Math Error");
    if (n > 170) throw new Error("Overflow");
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }
}

/**
 * --- CALCULATOR APPLICATION CONTROLLER ---
 */
class CalculatorApp {
  constructor() {
    // Math states
    this.expression = '';
    this.resultEvaluated = false;
    this.memoryValue = 0;

    // Instantiation
    this.sounds = new SoundEngine();

    // DOM bindings
    this.expressionLine = document.getElementById('expressionLine');
    this.primaryLine = document.getElementById('primaryLine');
    this.memoryBadge = document.getElementById('memoryBadge');
    this.calcCard = document.getElementById('calcCard');

    // Controls
    this.themePickerBtn = document.getElementById('themePickerBtn');
    this.themeDropdown = document.getElementById('themeDropdown');
    this.soundBtn = document.getElementById('soundBtn');
    this.historyBtn = document.getElementById('historyBtn');
    this.scientificToggleBtn = document.getElementById('scientificToggleBtn');
    this.scientificPanel = document.getElementById('scientificPanel');

    // History drawer Elements
    this.historyDrawer = document.getElementById('historyDrawer');
    this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.historyContent = document.getElementById('historyContent');

    // Load caches
    this.historyList = JSON.parse(localStorage.getItem('aether_calc_history')) || [];
    this.loadMemory();

    this.initEvents();
    this.renderHistory();
  }

  initEvents() {
    // Dropdown toggler
    this.themePickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.themeDropdown.classList.toggle('open');
    });
    
    // Close dropdown on clicking outside
    document.addEventListener('click', () => {
      this.themeDropdown.classList.remove('open');
    });

    // Theme selector options
    document.querySelectorAll('.theme-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        this.setTheme(theme);
      });
    });

    // Sound toggle
    this.soundBtn.addEventListener('click', () => {
      const enabled = this.sounds.toggle();
      this.soundBtn.classList.toggle('active', enabled);
      // Toggle SVGs
      this.soundBtn.querySelector('.sound-on-icon').classList.toggle('hidden', !enabled);
      this.soundBtn.querySelector('.sound-off-icon').classList.toggle('hidden', enabled);
    });

    // Drawer Toggles
    this.historyBtn.addEventListener('click', () => {
      this.sounds.play('special');
      this.historyDrawer.classList.add('open');
    });
    this.closeHistoryBtn.addEventListener('click', () => {
      this.sounds.play('special');
      this.historyDrawer.classList.remove('open');
    });
    this.clearHistoryBtn.addEventListener('click', () => {
      this.sounds.play('special');
      this.clearHistory();
    });

    // Scientific Drawer Toggle
    this.scientificToggleBtn.addEventListener('click', () => {
      this.sounds.play('special');
      const isCollapsed = this.scientificPanel.classList.toggle('collapsed');
      this.scientificToggleBtn.classList.toggle('active', !isCollapsed);
    });

    // Keypad Click Routing
    document.querySelectorAll('.keypad .btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        const action = btn.getAttribute('data-action');

        if (val !== null) {
          this.handleDigit(val);
        } else if (action !== null) {
          this.handleAction(action);
        }
      });
    });

    // Global Keypad binds
    window.addEventListener('keydown', (e) => {
      // Prevent browser default on navigation keys
      if (['Enter', 'Backspace', '/', '%'].includes(e.key)) {
        e.preventDefault();
      }

      const btn = this.getButtonByShortcut(e.key);
      if (btn) {
        btn.classList.add('active-key');
        btn.click();
        setTimeout(() => btn.classList.remove('active-key'), 100);
      }
    });
  }

  getButtonByShortcut(key) {
    if (key >= '0' && key <= '9') {
      return document.querySelector(`.btn[data-val="${key}"]`);
    }
    if (key === '.') {
      return document.querySelector(`.btn[data-val="."]`);
    }
    switch (key) {
      case '+': return document.querySelector('.btn[data-action="add"]');
      case '-': return document.querySelector('.btn[data-action="subtract"]');
      case '*':
      case 'x':
      case 'X': return document.querySelector('.btn[data-action="multiply"]');
      case '/': return document.querySelector('.btn[data-action="divide"]');
      case '%': return document.querySelector('.btn[data-action="percent"]');
      case '(': return document.querySelector('.btn[data-action="parenOpen"]');
      case ')': return document.querySelector('.btn[data-action="parenClose"]');
      case '^': return document.querySelector('.btn[data-action="power"]');
      case '!': return document.querySelector('.btn[data-action="factorial"]');
      case 'p':
      case 'P': return document.querySelector('.btn[data-action="pi"]');
      case 'e':
      case 'E': return document.querySelector('.btn[data-action="e"]');
      case 'Enter':
      case '=': return document.querySelector('.btn[data-action="equals"]');
      case 'Backspace': return document.querySelector('.btn[data-action="backspace"]');
      case 'Escape': return document.querySelector('.btn[data-action="clear"]');
    }
    return null;
  }

  setTheme(themeName) {
    document.body.className = '';
    document.body.classList.add(`theme-${themeName}`);

    // Update dropdown visuals
    document.querySelectorAll('.theme-opt').forEach(opt => {
      const isTarget = opt.getAttribute('data-theme') === themeName;
      opt.classList.toggle('active', isTarget);
    });

    // Subtly ping click
    this.sounds.play('special');
  }

  /**
   * Appends digits or decimal dot.
   */
  handleDigit(val) {
    this.sounds.play('digit');

    // If typing after a finished calculation, start fresh
    if (this.resultEvaluated) {
      this.expression = '';
      this.resultEvaluated = false;
    }

    if (val === '.') {
      // Prevent multiple decimals in the last number segment
      const lastNumMatch = this.expression.match(/[\d.]*$/);
      if (lastNumMatch && lastNumMatch[0].includes('.')) {
        return; // Ignore the dot input
      }
    }

    // Visual formatting blocks
    this.expression += val;
    this.updateDisplay();
  }

  /**
   * Action handling router.
   */
  handleAction(action) {
    // Determine sound type
    const soundType = ['equals'].includes(action) ? 'equals' : 
                      ['add', 'subtract', 'multiply', 'divide'].includes(action) ? 'operator' : 'special';
    this.sounds.play(soundType);

    if (this.resultEvaluated && !['equals', 'clear', 'backspace', 'negate', 'percent', 'm-plus', 'm-minus'].includes(action)) {
      // Allow cascading result directly into standard operators
      this.resultEvaluated = false;
    }

    switch (action) {
      case 'clear':
        this.expression = '';
        this.resultEvaluated = false;
        this.updateDisplay();
        break;

      case 'backspace':
        this.handleBackspace();
        break;

      case 'percent':
        // Append percentage sign visually, recursive parser handles calculations
        this.expression += '%';
        this.updateDisplay();
        break;

      case 'negate':
        this.handleNegate();
        break;

      // Primary Operators
      case 'add': this.expression += ' + '; break;
      case 'subtract': this.expression += ' − '; break; // Unicode minus
      case 'multiply': this.expression += ' × '; break;
      case 'divide': this.expression += ' ÷ '; break;

      // Scientific Operators
      case 'sin': this.expression += 'sin('; break;
      case 'cos': this.expression += 'cos('; break;
      case 'tan': this.expression += 'tan('; break;
      case 'log': this.expression += 'log('; break;
      case 'ln': this.expression += 'ln('; break;
      case 'sqrt': this.expression += 'sqrt('; break;
      case 'parenOpen': this.expression += '('; break;
      case 'parenClose': this.expression += ')'; break;
      case 'factorial': this.expression += '!'; break;
      case 'square': this.expression += '^2'; break;
      case 'cube': this.expression += '^3'; break;
      case 'power': this.expression += '^'; break;
      case 'pi': this.expression += 'π'; break;
      case 'e': this.expression += 'e'; break;
      case 'exp': this.expression += ' × 10^'; break;

      // Memory Storage Functions
      case 'mc': this.clearMemory(); break;
      case 'mr': this.recallMemory(); break;
      case 'm-plus': this.modifyMemory(1); break;
      case 'm-minus': this.modifyMemory(-1); break;

      // Execute
      case 'equals':
        this.evaluate();
        break;
    }

    this.updateDisplay();
  }

  handleBackspace() {
    if (this.expression.length === 0) return;
    
    // Check custom multi-char mathematical function terms
    const triggers = ['sin(', 'cos(', 'tan(', 'log(', 'sqrt(', 'ln(', ' × 10^'];
    let deleted = false;

    for (const trig of triggers) {
      if (this.expression.endsWith(trig)) {
        this.expression = this.expression.slice(0, -trig.length);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      // Check spacing surrounding standard visual operators
      if (this.expression.endsWith(' + ') || this.expression.endsWith(' − ') || 
          this.expression.endsWith(' × ') || this.expression.endsWith(' ÷ ')) {
        this.expression = this.expression.slice(0, -3);
      } else {
        this.expression = this.expression.slice(0, -1);
      }
    }
  }

  handleNegate() {
    // Negate the current running input visually
    // If expression is empty or a calculation was just evaluated
    if (this.expression === '' || this.resultEvaluated) {
      this.expression = '-';
      this.resultEvaluated = false;
      return;
    }

    // Try finding the last number segment to toggle prefixing unary minus
    const lastNumMatch = this.expression.match(/(-?\d+\.?\d*)$/);
    if (lastNumMatch) {
      const matchStr = lastNumMatch[0];
      const startIdx = this.expression.length - matchStr.length;
      if (matchStr.startsWith('-')) {
        this.expression = this.expression.substring(0, startIdx) + matchStr.substring(1);
      } else {
        this.expression = this.expression.substring(0, startIdx) + '-' + matchStr;
      }
    } else {
      // Otherwise, simply append negative sign or append standard subtraction minus
      if (this.expression.endsWith('-')) {
        this.expression = this.expression.slice(0, -1);
      } else {
        this.expression += '-';
      }
    }
  }

  /**
   * Parse and calculate expression.
   */
  evaluate() {
    if (this.expression.trim() === '') return;

    let inputExpr = this.expression;

    // Apply implicit multiplication preprocessing (e.g. 2(3) -> 2*(3), 2π -> 2*π, π2 -> π*2)
    inputExpr = inputExpr
      .replace(/(\d|π|e|\))(\(|sin|cos|tan|log|ln|sqrt|π|e)/g, '$1 * $2')
      .replace(/(π|e|\))(\d)/g, '$1 * $2');

    // Make visual elements parseable by normalising display terms
    // We already do replacement internally in MathParser constructor for basic symbols, 
    // but visual constants require direct conversion or parser mappings.
    try {
      const parser = new MathParser(inputExpr);
      const calculated = parser.parse();

      // Format clean final answer
      let formattedResult;
      if (isNaN(calculated) || !isFinite(calculated)) {
        throw new Error("Math Error");
      } else {
        // Trim rounding floats to maintain visual elegance (e.g., 0.1 + 0.2 = 0.3)
        formattedResult = Number(calculated.toFixed(10)).toString();
      }

      // Display result stream
      this.expressionLine.textContent = this.expression + ' =';
      this.primaryLine.textContent = formattedResult;

      // Add to Cache log
      this.addHistoryItem(this.expression, formattedResult);

      // Advance state
      this.expression = formattedResult;
      this.resultEvaluated = true;

    } catch (err) {
      // Visual feedback on card border for error alert
      this.calcCard.style.borderColor = '#ff4444';
      setTimeout(() => {
        this.calcCard.style.borderColor = 'var(--card-border)';
      }, 500);

      this.primaryLine.textContent = err.message || "Error";
      this.expressionLine.textContent = this.expression;
      this.resultEvaluated = true; // resets state on next click
    }
  }

  /**
   * Visual rendering & resizing handlers.
   */
  updateDisplay() {
    if (this.expression === '') {
      this.primaryLine.textContent = '0';
      this.expressionLine.textContent = '';
    } else {
      this.primaryLine.textContent = this.expression;
      if (!this.resultEvaluated) {
        this.expressionLine.textContent = '';
      }
    }

    // Auto-shrinking text to fit container
    const len = this.primaryLine.textContent.length;
    if (len <= 10) {
      this.primaryLine.style.fontSize = '2.8rem';
    } else if (len > 10 && len <= 16) {
      this.primaryLine.style.fontSize = '2.0rem';
    } else if (len > 16 && len <= 22) {
      this.primaryLine.style.fontSize = '1.6rem';
    } else {
      this.primaryLine.style.fontSize = '1.25rem';
    }
  }

  /**
   * Memory Storage Logic.
   */
  loadMemory() {
    this.memoryValue = parseFloat(localStorage.getItem('aether_calc_mem')) || 0;
    this.updateMemoryBadge();
  }

  saveMemory() {
    localStorage.setItem('aether_calc_mem', this.memoryValue);
    this.updateMemoryBadge();
  }

  updateMemoryBadge() {
    if (this.memoryValue !== 0) {
      this.memoryBadge.classList.remove('hidden');
    } else {
      this.memoryBadge.classList.add('hidden');
    }
  }

  clearMemory() {
    this.memoryValue = 0;
    this.saveMemory();
  }

  recallMemory() {
    if (this.resultEvaluated) {
      this.expression = '';
      this.resultEvaluated = false;
    }
    this.expression += this.memoryValue.toString();
    this.updateDisplay();
  }

  modifyMemory(dir) {
    let evalVal = 0;
    try {
      let inputExpr = this.expression;
      inputExpr = inputExpr
        .replace(/(\d|π|e|\))(\(|sin|cos|tan|log|ln|sqrt|π|e)/g, '$1 * $2')
        .replace(/(π|e|\))(\d)/g, '$1 * $2');
      const parser = new MathParser(inputExpr);
      evalVal = parser.parse();
    } catch(e) {
      const curVal = parseFloat(this.primaryLine.textContent);
      if (!isNaN(curVal)) evalVal = curVal;
    }

    this.memoryValue += dir * evalVal;
    this.saveMemory();
  }

  /**
   * History Logging & Persistence
   */
  addHistoryItem(exp, res) {
    // Avoid double inserts
    if (this.historyList.length > 0 && this.historyList[0].exp === exp) return;

    this.historyList.unshift({ exp, res });
    // Cap log items to 30 for local bounds
    if (this.historyList.length > 30) this.historyList.pop();

    localStorage.setItem('aether_calc_history', JSON.stringify(this.historyList));
    this.renderHistory();
  }

  renderHistory() {
    this.historyContent.innerHTML = '';
    
    if (this.historyList.length === 0) {
      this.historyContent.innerHTML = '<div class="empty-history-msg">No history cached yet. Run some operations!</div>';
      return;
    }

    this.historyList.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <span class="history-item-exp">${item.exp}</span>
        <span class="history-item-res">${item.res}</span>
      `;
      div.addEventListener('click', () => {
        this.sounds.play('special');
        this.expression = item.exp; // Load full expression to inspect/edit
        this.resultEvaluated = false;
        this.updateDisplay();
        this.historyDrawer.classList.remove('open');
      });
      this.historyContent.appendChild(div);
    });
  }

  clearHistory() {
    this.historyList = [];
    localStorage.removeItem('aether_calc_history');
    this.renderHistory();
  }
}

// Initialise Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CalculatorApp();
});
