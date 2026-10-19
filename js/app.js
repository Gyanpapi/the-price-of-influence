// js/app.js - Main Application Coordinator & View Router

class Application {
  constructor() {
    this.currentView = 'reader'; // 'reader', 'quiz', 'retention', 'flashcards', 'glossary', 'intro'
    this.activeChapter = 1;
    this.darkMode = localStorage.getItem('poi_dark_mode') === 'true';
  }

  init() {
    this.applyDarkMode();
    window.bookReader.init();

    // Check URL hash or default to reader
    const hash = window.location.hash.replace('#', '');
    if (hash && ['reader', 'quiz', 'retention', 'flashcards', 'glossary', 'intro'].includes(hash)) {
      this.showView(hash);
    } else {
      this.showView('reader');
    }

    // Populate Chapter Drawer & Navigation Dropdowns
    this.populateChapterNavigation();

    // Load initial chapter
    window.bookReader.loadChapter(this.activeChapter);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('poi_dark_mode', this.darkMode);
    this.applyDarkMode();
  }

  applyDarkMode() {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.innerHTML = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.innerHTML = '🌙';
    }
  }

  showView(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    // Hide all view containers
    const views = ['reader', 'quiz', 'retention', 'flashcards', 'glossary', 'intro'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // Update nav links active styling
    views.forEach(v => {
      const link = document.getElementById(`nav-link-${v}`);
      if (link) {
        if (v === viewName) {
          link.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-primary');
          link.classList.remove('text-muted-foreground');
        } else {
          link.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-primary');
          link.classList.add('text-muted-foreground');
        }
      }
    });

    // Lifecycle triggers for each view
    if (viewName === 'retention') {
      window.retentionDashboard.render();
    } else if (viewName === 'flashcards') {
      if (window.flashcardTrainer.deck.length === 0) {
        window.flashcardTrainer.initDeck('all');
      }
    } else if (viewName === 'glossary') {
      window.glossaryView.render();
    } else if (viewName === 'intro') {
      this.renderIntro();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openChapter(lawNum) {
    this.activeChapter = lawNum;
    this.showView('reader');
    window.bookReader.loadChapter(lawNum);
    this.closeDrawer();
  }

  populateChapterNavigation() {
    const allChapters = window.BOOK_CHAPTERS;
    const drawerList = document.getElementById('drawer-chapters-list');
    if (!drawerList) return;

    drawerList.innerHTML = allChapters.map(ch => {
      const isRead = window.srsEngine.isChapterRead(ch.law);
      const score = window.srsEngine.getLawRetentionScore(ch.law, ch.words);
      const badgeBg = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-slate-400';

      return `
        <button onclick="window.app.openChapter(${ch.law})" 
                class="w-full text-left p-3 rounded-xl hover:bg-muted transition-all flex items-center justify-between border border-transparent hover:border-border">
          <div class="pr-2">
            <div class="text-[11px] font-bold text-muted-foreground uppercase">Law ${ch.law}</div>
            <div class="text-sm font-serif font-semibold text-foreground line-clamp-1">${ch.title}</div>
            <div class="text-[10px] text-muted-foreground">${ch.words.length} words ${isRead ? '• Read' : ''}</div>
          </div>
          <span class="w-2.5 h-2.5 rounded-full ${badgeBg} flex-shrink-0" title="${score}% Retention"></span>
        </button>
      `;
    }).join('');
  }

  toggleDrawer() {
    const drawer = document.getElementById('table-of-contents-drawer');
    if (drawer) {
      drawer.classList.toggle('hidden');
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('table-of-contents-drawer');
    if (drawer) {
      drawer.classList.add('hidden');
    }
  }

  // --- QUIZ FLOW ---
  startChapterQuiz(chapterNum) {
    this.activeChapter = chapterNum;
    window.quizEngine.createChapterQuiz(chapterNum, 12);
    this.showView('quiz');
    this.renderQuizQuestion();
  }

  startSpiralRetentionWorkout() {
    window.quizEngine.createRetentionWorkoutQuiz(27, 15);
    this.showView('quiz');
    this.renderQuizQuestion();
  }

  startStumbleDrill() {
    const quiz = window.quizEngine.createStumbleQuiz();
    if (!quiz) {
      alert('No stumble words recorded yet! Great job maintaining high accuracy.');
      return;
    }
    this.showView('quiz');
    this.renderQuizQuestion();
  }

  startFlashcardsForChapter(chapterNum) {
    this.showView('flashcards');
    window.flashcardTrainer.initDeck('chapter', chapterNum);
  }

  renderQuizQuestion() {
    const q = window.quizEngine.getCurrentQuestion();
    const container = document.getElementById('quiz-view-content');
    if (!container) return;

    if (!q || window.quizEngine.isFinished()) {
      this.renderQuizSummary();
      return;
    }

    const currentQuiz = window.quizEngine.currentQuiz;
    const progress = Math.round(((window.quizEngine.currentIndex) / currentQuiz.totalCount) * 100);

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Quiz Header -->
        <div class="p-6 rounded-3xl bg-card border border-border/70 shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ${currentQuiz.title}
              </span>
              <div class="text-xs text-muted-foreground mt-0.5">
                Question ${window.quizEngine.currentIndex + 1} of ${currentQuiz.totalCount}
              </div>
            </div>

            <!-- CUMULATIVE RETENTION BADGE -->
            ${q.isCumulative ? `
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold animate-pulse">
                <span>🔄 Cumulative Review (Law ${q.law})</span>
              </div>
            ` : `
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <span>📖 Law ${q.law} Target Word</span>
              </div>
            `}
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="p-6 sm:p-8 rounded-3xl bg-card border-2 border-border shadow-xl space-y-6">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-primary uppercase tracking-wider">${q.prompt}</span>
              <button onclick="window.quizEngine.speakWord('${q.word}')" class="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                🔊 Listen Word
              </button>
            </div>

            ${q.sentence ? `
              <div class="p-5 rounded-2xl bg-secondary/30 border border-border/50 font-serif text-lg text-foreground leading-relaxed">
                ${q.sentence}
              </div>
            ` : ''}

            ${q.confusable ? `
              <div class="text-xs p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                ⚠️ Hint: Be careful of easily confused counterparts for this word!
              </div>
            ` : ''}
          </div>

          <!-- Multiple Choice Options -->
          <div id="quiz-options-grid" class="grid grid-cols-1 gap-3">
            ${q.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const encoded = encodeURIComponent(opt);
              return `
                <button data-opt="${encoded}"
                        onclick="window.app.handleQuizOptionSelect(this, decodeURIComponent(this.dataset.opt))" 
                        class="quiz-opt-btn w-full p-4 rounded-2xl border border-border bg-background hover:bg-muted/60 text-left font-medium text-foreground transition-all flex items-start gap-3">
                  <span class="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    ${letter}
                  </span>
                  <span class="leading-relaxed text-sm sm:text-base">${opt}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Explanation Box (Appears after selection) -->
          <div id="quiz-explanation-box" class="hidden p-5 rounded-2xl border transition-all"></div>

          <!-- Next Button -->
          <div id="quiz-next-bar" class="hidden flex justify-end pt-2">
            <button onclick="window.app.handleQuizNext()" 
                    class="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 flex items-center gap-2">
              Next Question →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  handleQuizOptionSelect(buttonElement, selectedText) {
    // Disable all options
    const allButtons = document.querySelectorAll('.quiz-opt-btn');
    allButtons.forEach(b => b.disabled = true);

    const result = window.quizEngine.submitAnswer(selectedText);
    if (!result) return;

    // Highlight options
    allButtons.forEach(b => {
      const bOpt = decodeURIComponent(b.dataset.opt || '');
      if (bOpt.trim().toLowerCase() === result.correctAnswer.trim().toLowerCase()) {
        b.classList.remove('bg-background', 'border-border');
        b.classList.add('bg-emerald-500/15', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
        b.querySelector('span:first-child').classList.add('bg-emerald-500', 'text-white');
      } else if (b === buttonElement && !result.isCorrect) {
        b.classList.remove('bg-background', 'border-border');
        b.classList.add('bg-rose-500/15', 'border-rose-500', 'text-rose-700', 'dark:text-rose-300');
        b.querySelector('span:first-child').classList.add('bg-rose-500', 'text-white');
      }
    });

    // Show Explanation Box
    const expBox = document.getElementById('quiz-explanation-box');
    const nextBar = document.getElementById('quiz-next-bar');
    if (expBox) {
      expBox.classList.remove('hidden');
      if (result.isCorrect) {
        expBox.className = 'p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-foreground space-y-2';
        expBox.innerHTML = `
          <div class="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
            <span>✓ Correct!</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20">Leitner Box ${result.box} (+1 Level)</span>
          </div>
          <p class="text-sm"><strong>${result.question.word}</strong>: ${result.question.definition}</p>
          ${result.question.originalSentence ? `
            <div class="text-xs text-muted-foreground italic pt-1 border-t border-emerald-500/20">
              "${result.question.originalSentence}"
            </div>
          ` : ''}
        `;
      } else {
        expBox.className = 'p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-foreground space-y-2';
        expBox.innerHTML = `
          <div class="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
            <span>✕ Incorrect</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-rose-500/20">Moved to Box 1 (Scheduled for Review)</span>
          </div>
          <p class="text-sm">Correct answer: <strong>${result.correctAnswer}</strong></p>
          <p class="text-xs text-muted-foreground">Definition: ${result.question.definition}</p>
          ${result.question.originalSentence ? `
            <div class="text-xs text-muted-foreground italic pt-1 border-t border-rose-500/20">
              "${result.question.originalSentence}"
            </div>
          ` : ''}
        `;
      }
    }

    if (nextBar) {
      nextBar.classList.remove('hidden');
    }
  }

  handleQuizNext() {
    window.quizEngine.nextQuestion();
    this.renderQuizQuestion();
  }

  renderQuizSummary() {
    const summary = window.quizEngine.getSummary();
    const container = document.getElementById('quiz-view-content');
    if (!container) return;

    const pass = summary.accuracy >= 75;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="p-8 sm:p-10 rounded-3xl bg-card border-2 border-border shadow-2xl text-center space-y-6">
          <div class="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl ${pass ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}">
            ${pass ? '🏆' : '📚'}
          </div>

          <div>
            <h2 class="text-3xl font-serif font-bold text-foreground mb-2">
              ${pass ? 'Excellent Retention!' : 'Review Completed'}
            </h2>
            <p class="text-sm text-muted-foreground max-w-md mx-auto">
              ${pass ? 'You have demonstrated strong recall. Words answered correctly have advanced to higher Leitner boxes for longer spaced intervals.' : 'Good practice! Words you missed have been flagged as Stumble Words and placed in Box 1 for rapid review.'}
            </p>
          </div>

          <!-- Overall Score Badge -->
          <div class="inline-flex items-baseline gap-2 px-6 py-3 rounded-2xl bg-secondary/50 border border-border">
            <span class="text-4xl font-extrabold text-primary">${summary.accuracy}%</span>
            <span class="text-sm text-muted-foreground">(${summary.score} / ${summary.total} correct)</span>
          </div>

          <!-- Cumulative Retention Breakdown Matrix -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div class="p-4 rounded-2xl bg-muted/40 border border-border/50">
              <div class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Current Chapter Words
              </div>
              <div class="text-2xl font-bold text-foreground">
                ${summary.currentCorrect} / ${summary.currentTotal}
              </div>
              <div class="text-xs text-muted-foreground mt-1">Law ${summary.chapterNum || ''} vocabulary</div>
            </div>

            <div class="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
              <div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                Cumulative Prior Words
              </div>
              <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ${summary.cumulativeTotal > 0 ? `${summary.cumulativeCorrect} / ${summary.cumulativeTotal}` : 'N/A (Ch 1)'}
              </div>
              <div class="text-xs text-muted-foreground mt-1">Retention of earlier chapters</div>
            </div>
          </div>

          <!-- Missed words list if any -->
          ${summary.missedWords.length > 0 ? `
            <div class="text-left p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
              <div class="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
                Words Needing Review (${summary.missedWords.length}):
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${summary.missedWords.map(w => `
                  <button onclick="window.bookReader.showWordModal('${w}')" class="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold text-xs hover:bg-rose-500/20">
                    ${w} 🔍
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Action buttons -->
          <div class="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border">
            ${summary.chapterNum && summary.chapterNum < 27 ? `
              <button onclick="window.app.openChapter(${summary.chapterNum + 1})" 
                      class="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 flex items-center gap-2">
                Proceed to Law ${summary.chapterNum + 1} →
              </button>
            ` : ''}

            <button onclick="window.app.startChapterQuiz(${summary.chapterNum || 1})" 
                    class="px-5 py-3 rounded-xl border border-border text-foreground hover:bg-muted font-medium">
              Retake Quiz
            </button>

            <button onclick="window.app.showView('retention')" 
                    class="px-5 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium">
              View Retention Stats
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderIntro() {
    const container = document.getElementById('intro-view-content');
    if (!container) return;

    const meta = window.BOOK_METADATA;
    const intro = meta.intro;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="p-8 sm:p-12 rounded-3xl bg-card border border-border shadow-xl space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <span>An Original Vocabulary Book</span>
          </div>

          <h1 class="text-4xl sm:text-5xl font-serif font-black text-foreground">
            ${meta.bookTitle}
          </h1>
          <p class="text-lg text-muted-foreground font-serif italic">
            ${meta.subtitle} • 333 vocabulary entries from Gradify
          </p>

          <div class="p-6 rounded-2xl bg-secondary/30 border border-border/50 text-foreground font-serif leading-relaxed space-y-4">
            <h3 class="text-xl font-bold font-sans text-primary">Before you enter Namar</h3>
            <p class="whitespace-pre-line">${intro.before_you_enter.text}</p>
          </div>

          <div class="p-6 rounded-2xl bg-card border border-border text-foreground font-serif leading-relaxed space-y-4">
            <h3 class="text-xl font-bold font-sans text-primary">How to make the words stay</h3>
            <p class="whitespace-pre-line">${intro.how_to_make_stay.text}</p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-foreground">The People You Will Meet</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${intro.characters.map(c => `
                <div class="p-4 rounded-xl border border-border bg-background">
                  <div class="font-serif font-bold text-foreground text-base">${c.name}</div>
                  <div class="text-xs text-muted-foreground mt-1">${c.role}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-6 border-t border-border flex justify-center">
            <button onclick="window.app.openChapter(1)" class="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xl hover:bg-primary/90 transition-all flex items-center gap-3">
              <span>Enter Namar: Begin Law 1</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// Instantiate global app
window.app = new Application();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
