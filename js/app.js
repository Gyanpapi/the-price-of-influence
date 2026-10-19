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

    const kanjiNums = ["〇", "壱", "弐", "参", "四", "五", "六", "七", "八", "九", "十", 
                       "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                       "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七"];

    drawerList.innerHTML = allChapters.map(ch => {
      const isRead = window.srsEngine.isChapterRead(ch.law);
      const score = window.srsEngine.getLawRetentionScore(ch.law, ch.words);
      const badgeBorder = score >= 80 ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300' : score >= 50 ? 'border-amber-600 text-amber-800 dark:text-amber-300' : 'border-slate-400 text-muted-foreground';

      return `
        <button onclick="window.app.openChapter(${ch.law})" 
                class="catalog-card w-full text-left p-3 rounded border border-border hover:border-primary transition-all flex items-center justify-between font-serif">
          <div class="pr-2">
            <div class="text-[10px] font-mono font-bold text-primary">
              【 第${kanjiNums[ch.law] || ch.law}則 】 LAW ${String(ch.law).padStart(2, '0')}
            </div>
            <div class="text-sm font-serif font-bold text-foreground line-clamp-1 mt-0.5">${ch.title}</div>
            <div class="text-[10px] font-mono text-muted-foreground mt-0.5">${ch.words.length} 語 ${isRead ? '• 読了済' : '• 未読'}</div>
          </div>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 border ${badgeBorder} rounded flex-shrink-0">
            ${score}%
          </span>
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
    const kanjiLetters = ["甲", "乙", "丙", "丁"];

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Examination Header Card -->
        <div class="catalog-card p-5 sm:p-6 rounded border-2 border-border shadow-sm space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-dashed border-border/70">
            <div>
              <div class="flex items-center gap-2">
                <span class="hanko-stamp text-[10px]">筆記試験</span>
                <span class="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">
                  ${currentQuiz.title}
                </span>
              </div>
              <div class="text-xs font-mono text-muted-foreground mt-1">
                問 第 ${window.quizEngine.currentIndex + 1} 題 / 全 ${currentQuiz.totalCount} 題
              </div>
            </div>

            <!-- CUMULATIVE RETENTION BADGE -->
            ${q.isCumulative ? `
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono">
                <span>🔄 【 累計回帰 】 Law ${q.law} 語彙</span>
              </div>
            ` : `
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-primary/30 bg-primary/10 text-primary text-xs font-bold font-mono">
                <span>📖 【 当則課題 】 Law ${q.law} 語彙</span>
              </div>
            `}
          </div>

          <!-- Progress Bar -->
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>進捗率</span>
              <span>${progress}%</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-1.5 overflow-hidden border border-border/50">
              <div class="bg-primary h-1.5 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="vintage-frame p-6 sm:p-8 rounded bg-card text-foreground font-serif shadow-lg space-y-6">
          <div class="space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-border/60">
              <span class="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                【 設問 】 ${q.prompt}
              </span>
              <button onclick="window.quizEngine.speakWord('${q.word}')" class="text-xs font-mono text-primary flex items-center gap-1 hover:underline">
                🔊 音声
              </button>
            </div>

            ${q.sentence ? `
              <div class="p-4 sm:p-5 rounded border border-border bg-secondary/30 font-serif text-lg text-foreground leading-relaxed">
                ${q.sentence}
              </div>
            ` : ''}

            ${q.confusable ? `
              <div class="text-xs p-2.5 rounded border border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-sans">
                ⚠️ 識別留意: 紛らわしい類似語にご注意ください
              </div>
            ` : ''}
          </div>

          <!-- Multiple Choice Options (Kanji Slips: 甲, 乙, 丙, 丁) -->
          <div id="quiz-options-grid" class="grid grid-cols-1 gap-3">
            ${q.options.map((opt, idx) => {
              const letter = kanjiLetters[idx] || String.fromCharCode(65 + idx);
              const encoded = encodeURIComponent(opt);
              return `
                <button data-opt="${encoded}"
                        onclick="window.app.handleQuizOptionSelect(this, decodeURIComponent(this.dataset.opt))" 
                        class="quiz-opt-btn w-full p-4 rounded border border-border bg-card hover:bg-secondary/70 text-left font-serif text-foreground transition-all flex items-start gap-3">
                  <span class="w-7 h-7 rounded border border-border bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 font-mono">
                    ${letter}
                  </span>
                  <span class="leading-relaxed text-sm sm:text-base">${opt}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Explanation Box -->
          <div id="quiz-explanation-box" class="hidden p-5 rounded border transition-all font-serif"></div>

          <!-- Next Button -->
          <div id="quiz-next-bar" class="hidden flex justify-end pt-2">
            <button onclick="window.app.handleQuizNext()" 
                    class="px-6 py-2.5 rounded bg-primary text-primary-foreground font-serif font-bold shadow hover:bg-primary/90 flex items-center gap-2 text-sm">
              次問へ進む (Next Question) →
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
        b.classList.remove('bg-card', 'border-border');
        b.classList.add('bg-emerald-500/15', 'border-emerald-600', 'text-emerald-800', 'dark:text-emerald-200');
        b.querySelector('span:first-child').classList.add('bg-emerald-700', 'text-white');
      } else if (b === buttonElement && !result.isCorrect) {
        b.classList.remove('bg-card', 'border-border');
        b.classList.add('bg-rose-500/15', 'border-rose-600', 'text-rose-800', 'dark:text-rose-200');
        b.querySelector('span:first-child').classList.add('bg-rose-700', 'text-white');
      }
    });

    // Show Explanation Box with Hanko Stamp
    const expBox = document.getElementById('quiz-explanation-box');
    const nextBar = document.getElementById('quiz-next-bar');
    if (expBox) {
      expBox.classList.remove('hidden');
      if (result.isCorrect) {
        expBox.className = 'p-5 rounded bg-emerald-500/10 border-2 border-emerald-600/40 text-foreground space-y-2';
        expBox.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="hanko-stamp text-[10px]">合格・正解</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 font-bold text-emerald-800 dark:text-emerald-300">
              Leitner Box ${result.box} (定着段階昇進)
            </span>
          </div>
          <p class="text-sm font-medium"><strong>${result.question.word}</strong>: ${result.question.definition}</p>
          ${result.question.originalSentence ? `
            <div class="text-xs text-muted-foreground italic pt-2 border-t border-emerald-500/20">
              "${result.question.originalSentence}"
            </div>
          ` : ''}
        `;
      } else {
        expBox.className = 'p-5 rounded bg-rose-500/10 border-2 border-rose-600/40 text-foreground space-y-2';
        expBox.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="hanko-stamp text-[10px]">誤答・要復習</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 font-bold text-rose-800 dark:text-rose-300">
              壱の箱 (Box 1) に再配置
            </span>
          </div>
          <p class="text-sm font-medium">正解: <strong>${result.correctAnswer}</strong></p>
          <p class="text-xs text-muted-foreground">語義: ${result.question.definition}</p>
          ${result.question.originalSentence ? `
            <div class="text-xs text-muted-foreground italic pt-2 border-t border-rose-500/20">
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
        <div class="catalog-card p-8 sm:p-10 rounded border-2 border-border shadow-xl text-center space-y-6 relative overflow-hidden font-serif">
          
          <div class="inline-flex p-3 rounded-full border-2 border-primary text-primary mb-2">
            <span class="hanko-stamp text-sm">${pass ? '試験合格' : '修学継続'}</span>
          </div>

          <div>
            <div class="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
              【 波間市・筆記試問結果調書 】 EXAMINATION RECORD
            </div>
            <h2 class="text-3xl font-serif font-black text-foreground mb-2">
              ${pass ? '合格証書 (Proficiency Achieved)' : '試問終了・要反復演習'}
            </h2>
            <p class="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              ${pass ? '正解した語彙はより長い記憶間隔（次段階の箱）へと昇進しました。' : '誤答した語彙は「要復習語彙」として壱の箱（24時間後）に記録され、再学習の優先度が高まりました。'}
            </p>
          </div>

          <!-- Overall Score Badge -->
          <div class="inline-flex items-baseline gap-2 px-6 py-3 rounded border-2 border-border bg-secondary/40 font-mono">
            <span class="text-4xl font-extrabold text-primary">${summary.accuracy}%</span>
            <span class="text-xs text-muted-foreground">(${summary.score} / ${summary.total} 正解)</span>
          </div>

          <!-- Cumulative Retention Breakdown Matrix -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div class="catalog-card p-4 rounded border border-border bg-card">
              <div class="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                【 当則語彙 】 Current Law Words
              </div>
              <div class="text-2xl font-bold font-mono text-foreground">
                ${summary.currentCorrect} / ${summary.currentTotal}
              </div>
              <div class="text-xs text-muted-foreground mt-1">Law ${summary.chapterNum || ''} 課題語彙の正解数</div>
            </div>

            <div class="catalog-card p-4 rounded border border-border bg-indigo-500/5">
              <div class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
                【 累計回帰 】 Prior Laws Retention
              </div>
              <div class="text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-300">
                ${summary.cumulativeTotal > 0 ? `${summary.cumulativeCorrect} / ${summary.cumulativeTotal}` : '該当なし (Law 1)'}
              </div>
              <div class="text-xs text-muted-foreground mt-1">過去章からの回帰出題の保持率</div>
            </div>
          </div>

          <!-- Missed words list if any -->
          ${summary.missedWords.length > 0 ? `
            <div class="text-left p-4 rounded border border-rose-600/30 bg-rose-500/5">
              <div class="text-xs font-mono font-bold text-rose-700 dark:text-rose-300 mb-2">
                【 要復習語彙リスト 】 (${summary.missedWords.length} 語):
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${summary.missedWords.map(w => `
                  <button onclick="window.bookReader.showWordModal('${w}')" class="px-2.5 py-1 rounded border border-rose-500/30 bg-card text-rose-800 dark:text-rose-300 font-bold text-xs hover:bg-rose-500/10">
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
                      class="px-6 py-2.5 rounded bg-primary text-primary-foreground font-serif font-bold shadow hover:bg-primary/90 flex items-center gap-2 text-sm">
                次則 (Law ${summary.chapterNum + 1}) へ進む →
              </button>
            ` : ''}

            <button onclick="window.app.startChapterQuiz(${summary.chapterNum || 1})" 
                    class="px-5 py-2.5 rounded border border-border bg-card text-foreground hover:bg-secondary font-serif font-medium text-xs">
              再試験 (Retake)
            </button>

            <button onclick="window.app.showView('retention')" 
                    class="px-5 py-2.5 rounded border border-border bg-secondary text-secondary-foreground hover:opacity-80 font-serif font-medium text-xs">
              記憶台帳を確認
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
      <div class="max-w-4xl mx-auto space-y-8 font-serif">
        <div class="catalog-card p-8 sm:p-12 rounded border-2 border-border shadow-lg space-y-6">
          <div class="flex items-center gap-2">
            <span class="hanko-stamp text-xs">解題</span>
            <span class="archive-badge">NAMAR MUNICIPAL LITERARY ARCHIVE</span>
          </div>

          <h1 class="text-4xl sm:text-5xl font-serif font-black text-foreground tracking-tight">
            ${meta.bookTitle}
          </h1>
          <p class="text-sm font-mono text-muted-foreground uppercase tracking-widest">
            ${meta.subtitle} • GRADIFY 333 VOCABULARY CORPUS
          </p>

          <div class="vintage-frame p-6 rounded bg-card border border-border text-foreground font-serif leading-loose space-y-4">
            <div class="flex items-center gap-2 pb-2 border-b border-dashed border-border/70">
              <span class="hanko-circle text-xs">序</span>
              <h3 class="text-lg font-serif font-bold text-primary">【 波間市への道程 】 Before you enter Namar</h3>
            </div>
            <p class="whitespace-pre-line text-sm sm:text-base">${intro.before_you_enter.text}</p>
          </div>

          <div class="vintage-frame p-6 rounded bg-card border border-border text-foreground font-serif leading-loose space-y-4">
            <div class="flex items-center gap-2 pb-2 border-b border-dashed border-border/70">
              <span class="hanko-circle text-xs">訓</span>
              <h3 class="text-lg font-serif font-bold text-primary">【 記憶定着の秘訣 】 How to make the words stay</h3>
            </div>
            <p class="whitespace-pre-line text-sm sm:text-base">${intro.how_to_make_stay.text}</p>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2 pb-1 border-b border-border/60">
              <span class="hanko-stamp text-[10px]">人物録</span>
              <h3 class="text-lg font-serif font-bold text-foreground">波間市・主要登場人物略歴</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${intro.characters.map(c => `
                <div class="catalog-card p-4 rounded border border-border bg-card">
                  <div class="font-serif font-bold text-foreground text-base">${c.name}</div>
                  <div class="text-xs text-muted-foreground font-serif mt-1">${c.role}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-6 border-t border-border flex justify-center">
            <button onclick="window.app.openChapter(1)" class="px-8 py-3.5 rounded bg-primary text-primary-foreground font-serif font-bold text-base shadow hover:bg-primary/90 transition-all flex items-center gap-3">
              <span>第一則へ入館：読本を開始</span>
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
