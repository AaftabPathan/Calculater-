# 🌌 Aether Calc — Premium Glassmorphic Calculator

A state-of-the-art, visually stunning **Frosted Glassmorphic Calculator** crafted using **pure Vanilla HTML, CSS, and modern JavaScript**. Featuring highly refined mathematical operations, modular styling engines, micro-animations, keyboard bindings, and real-time synthesized browser click feedback.

---

## ✨ Features at a Glance

### 🎨 Design & Aesthetic Excellence
* **Cosmic Neon Glassmorphism**: High-contrast, semi-transparent frosted panels (`backdrop-filter: blur(25px)`) layered over slow-drifting deep-space gradient background orbs.
* **Three Handcrafted Themes**:
  * 🌌 **Cosmic Dark (Default)**: Deep space backdrop with violet and cyan glowing accents.
  * 🍃 **Emerald Aurora**: Black-teal canvas with emerald and sea-foam interactive glows.
  * 🌸 **Sakura Glass**: Frosted light-rose canvassing with violet and rose-gold details.
* **Responsive Visual Reflow**: Visual text auto-scales from `2.8rem` down to `1.25rem` in real-time depending on the input length to maintain a clean boundary layout.

### 🔊 Programmatic Synthesized Audio Feedback
* Leverages the browser's native **Web Audio API** to programmatically generate organic synthesizer clicks on-demand (no heavy external audio files to load):
  * **Standard Keys**: Clean, fast triangular transient click sound.
  * **Operators**: Slightly higher-pitch tactical feedback sound.
  * **Equal Key**: Gorgeous dual-oscillator resonant C5/G5 success chime.
  * **Mute Control**: Instant sound toggle integrated directly into the header settings.

### 📐 Advanced Mathematical Engine (RDP)
* **Secure Parsing**: Completely avoids insecure `eval()` implementations, utilizing a robust, custom **Recursive Descent Parser (RDP)**.
* **Mathematical Operations**:
  * Standard calculations with proper algebraic operator precedence.
  * Trigonometric functions (`sin`, `cos`, `tan`) evaluated in intuitive **degrees** (e.g. `sin(30)` = `0.5`).
  * Powers (`x²`, `x³`, `xʸ`), factorials (`x!`), square root (`√`), natural log (`ln`), base-10 log (`log`), and constants (`π`, `e`).
  * **Implicit Multiplication**: Safe pre-scanning preprocessor that auto-injects operators (e.g. `2π` -> `2 * π`, `(3)(4)` -> `3 * 4`).
  * **Auto-Close Parentheses**: Standard-setting auto-bracket closes at evaluation (e.g. `sin(30` successfully triggers as `sin(30)`).
  * **Percentage Postfix Scaling**: Postfix `%` support (e.g., `50%` scales to `0.5` and `10 + 20%` correctly evaluates to `10.2`).

### 📂 Interactive Drawers
* **Scientific Panel**: Smooth, hardware-accelerated drawer slides outward on desktop and wraps into a collapsible drawer panel on mobile devices.
* **Persistent History Logs**: Remembers up to 30 past equations. Persisted through standard `localStorage` so they remain cached across browser sessions. Clicking a log loads the parent equation back into the editor!

---

## ⌨️ Keyboard Shortcuts Mapping

Aether Calc is fully mapped to physical keyboard triggers, complete with micro-scale visual compression animations on the active key buttons.

| Keyboard Key | Action / Function |
| :--- | :--- |
| `0` - `9` | Appends numbers |
| `.` | Decimal dot (automatically ignores duplicate entry points) |
| `+` | Addition |
| `-` | Subtraction |
| `*` or `x` | Multiplication |
| `/` | Division |
| `%` | Postfix percentage scaling |
| `^` | Exponential power base (`xʸ`) |
| `!` | Factorial postfix (`x!`) |
| `p` or `P` | Mathematical constant Pi (`π`) |
| `e` or `E` | Mathematical constant Euler's Number (`e`) |
| `(` and `)` | Parentheses grouping |
| `Backspace` | Deletes last segment (handles multi-character terms like `sin(` instantly) |
| `Escape` | Clear All (AC) |
| `Enter` or `=` | Triggers math engine evaluation |

---

## 🚀 Quick Start / How to Run

Since Aether Calc has zero dependencies, you can run it instantly using any of the following methods:

### Option 1: Double-Click (Simplest)
Simply double-click the **`index.html`** file inside your file browser. It will immediately launch inside your default web browser.

### Option 2: Command Line (Fast)
To open directly from your terminal:
```bash
# In Windows PowerShell:
Start-Process index.html

# In Windows Command Prompt (CMD):
start index.html
```

### Option 3: Local Server (For live development)
If you have **Node.js** or **Python** installed:
```bash
# Using Node.js (serves on port 8080)
npx http-server

# Using Python (serves on port 8000)
python -m http.server 8000
```
Then open `http://localhost:8080` or `http://localhost:8000` in your browser.

---

## 📁 File Structure

```text
Calculater/
├── .vscode/
│   └── launch.json     # VS Code debug launcher setup
├── .gitignore          # Repository git manager filter
├── README.md           # Visual markdown showcase
├── index.html          # Semantic HTML markup
├── style.css           # Glassmorphic themes styling engine
└── script.js           # Math parser, audio system, & UI bindings
```

---

## 🛡️ License
Designed with 💜. Feel free to clone, customize, and build on top of Aether Calc!
