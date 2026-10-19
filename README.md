# The Price of Influence — Interactive Vocabulary & Spaced Repetition System

An interactive web application designed to master 333 high-frequency vocabulary words through the teaching novel **"The Price of Influence: 27 Laws of Judgment"**.

## 🌟 Key Features

### 1. Interactive Book Reader (`📖 Read Book`)
- **Full Text of all 27 Laws of Judgment**: Mira's story in the river city of Namar across disputed accounts, the collapsing levee wall, public hearings, and political intrigue.
- **5 Structured Pedagogical Sections per Law**:
  1. *The Scene*: The real crisis in Namar introducing the 12-14 target words in action.
  2. *The Price*: The consequences of poor judgment, deceit, or inaction.
  3. *The Countermove*: How strategic clarity and principled decisions turned the tide.
  4. *Beyond the City*: Modern real-world analogies (software engineering teams, meetings, business negotiations, personal relationships).
  5. *The Law in Practice*: Concrete reflection exercises and habit formation prompts.
- **Interactive Clickable Target Words**:
  - Every occurrence of every vocabulary word is dynamically tagged.
  - Clicking any word opens a quick card with the definition, pronunciation audio (Web Speech API), current Leitner box, and direct mastery toggle.
- **Audio Narration ("🎧 Listen Law")**:
  - Full-chapter read-aloud via browser speech synthesis.
- **Customizable Reading Settings**:
  - 4 Reading Themes: *Warm Parchment*, *Crisp Paper*, *Midnight Dark*, and *Slate Blue*.
  - Font size controls (A- / A+) and custom typography (Literata serif).

### 2. Cumulative Retention Testing Engine (`⚡ Chapter Quiz`)
- **Active Recall After Every Law**:
  - Test yourself immediately after finishing any chapter.
- **Automated Cumulative Spiral Review**:
  - When testing **Law $N$**, the engine dynamically selects ~60% questions from Law $N$ and **~40% cumulative review from Laws 1 through $N-1$**.
  - Review questions prioritize **stumble words** (previously missed) and words overdue according to their **forgetting curve**!
  - Cumulative questions are labeled with a distinct **`🔄 Cumulative Review (Law X)`** badge.
- **Varied Question Formats**:
  - *Contextual Cloze / Fill-in-the-Blank*: Real story sentences with the word masked out.
  - *Word to Definition Matching*.
  - *Definition to Word Reverse Recall*.
  - *Confusable Pair Hints & Distinctions* (e.g., `disinterested` vs `uninterested`, `ingenuous` vs `disingenuous`, `discrete` vs `discreet`, `enervate` vs `energize`).
- **Instant Audio Feedback & Explanations**:
  - Chimes for correct/incorrect answers via Web Audio API.
  - Explanations quoting the story context and indicating Leitner Box promotions.

### 3. Spaced Repetition Retention Center (`🧠 Memory Dashboard`)
- **Ebbinghaus Forgetting Curve Countermeasure**:
  - Words advance through **5 Leitner Boxes**:
    - **Box 1 (Fragile)**: Review every 24 hours.
    - **Box 2 (Learning)**: Review every 3 days.
    - **Box 3 (Retained)**: Review every 7 days.
    - **Box 4 (Solid)**: Review every 14 days.
    - **Box 5 (Mastered)**: Review every 30 days.
  - Missing any question immediately moves the word to Box 1 for rapid recovery.
- **Chapter-by-Chapter Retention Health Score**:
  - Color-coded badges indicating retention levels ($80\%+$ Solid, $50-79\%$ Moderate, $<50\%$ Fragile).
- **One-Click Quick Retention Workout**:
  - 15-question mixed review pulling from all chapters read so far.
- **Stumble Words Recovery Drill**:
  - Isolate and practice only words you have previously missed.
- **Backup & Restore**:
  - Export and import your learning progress as a `.json` file anytime.

### 4. 3D Leitner Flashcards Deck (`🗂️ Flashcards`)
- Smooth 3D flipping flashcards with hotkeys (`Space` to flip, `1` Again, `2` Hard, `3` Good, `4` Easy).
- Filter by: *All 333 Words*, *Current Chapter*, *Due Today*, or *Stumble Words*.

### 5. Vocabulary Directory (`📚 Glossary`)
- Search all 333 words live by keyword or definition.
- Filter by Law (1-27), Leitner Stage (Box 1-5), or Alphabet (A-Z).
- In-depth modal showing all 5 contextual encounters in the novel.

---

## 🚀 How to Run the Website

### Option 1: Using the Active Local Web Server
The built-in web server is already running in background at:
```
http://localhost:8080
```
Simply open your browser and navigate to `http://localhost:8080`!

### Option 2: Opening Directly in Any Browser
Double-click `index.html` inside:
```
C:\Users\User\.gemini\antigravity\scratch\the-price-of-influence\index.html
```
The entire application is completely self-contained with zero build step required.

### Option 3: Starting a New Server
From PowerShell:
```powershell
cd C:\Users\User\.gemini\antigravity\scratch\the-price-of-influence
python -m http.server 8080
```
