// js/flashcards.js - 3D Leitner Flashcard Trainer

class FlashcardTrainer {
  constructor() {
    this.deck = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.filterMode = 'all'; // 'all', 'chapter', 'due', 'stumble'
    this.chapterFilter = 1;
  }

  initDeck(mode = 'all', chapterNum = 1) {
    this.filterMode = mode;
    this.chapterFilter = chapterNum;
    this.isFlipped = false;
    this.currentIndex = 0;

    const allGlossary = window.VOCAB_GLOSSARY;

    if (mode === 'chapter') {
      this.deck = allGlossary.filter(g => g.law === chapterNum);
    } else if (mode === 'due') {
      this.deck = allGlossary.filter(g => window.srsEngine.isWordDue(g.word));
      if (this.deck.length === 0) {
        // Fallback to random if no words are strictly due
        this.deck = window.srsEngine.shuffleArray(allGlossary).slice(0, 20);
      }
    } else if (mode === 'stumble') {
      this.deck = window.srsEngine.getStumbleWords(allGlossary);
      if (this.deck.length === 0) {
        this.deck = allGlossary.slice(0, 15);
      }
    } else {
      this.deck = [...allGlossary];
    }

    this.deck = window.srsEngine.shuffleArray(this.deck);
    this.render();
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
    const cardEl = document.getElementById('flashcard-inner');
    if (cardEl) {
      if (this.isFlipped) {
        cardEl.classList.add('flipped');
      } else {
        cardEl.classList.remove('flipped');
      }
    }
  }

  rateCard(rating) {
    // rating: 'again' (fail), 'hard', 'good', 'easy'
    const card = this.getCurrentCard();
    if (!card) return;

    const isCorrect = (rating === 'good' || rating === 'easy');
    const rec = window.srsEngine.recordReview(card.word, isCorrect, card.law);

    if (rating === 'easy' && rec.box < 5) {
      rec.box = Math.min(5, rec.box + 1);
      window.srsEngine.saveData();
    }

    // Play audio feedback
    window.quizEngine.playTone(isCorrect ? 'correct' : 'incorrect');

    // Advance to next card
    this.isFlipped = false;
    this.currentIndex++;
    this.render();
  }

  getCurrentCard() {
    if (this.currentIndex >= this.deck.length) return null;
    return this.deck[this.currentIndex];
  }

  render() {
    const container = document.getElementById('flashcards-view-content');
    if (!container) return;

    if (this.deck.length === 0 || this.currentIndex >= this.deck.length) {
      container.innerHTML = `
        <div class="max-w-xl mx-auto p-8 rounded-3xl bg-card border border-border text-center shadow-xl">
          <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center text-3xl mb-4">
            🎉
          </div>
          <h3 class="text-2xl font-serif font-bold text-foreground mb-2">Deck Completed!</h3>
          <p class="text-muted-foreground text-sm mb-6">You have reviewed all cards in this session. All ratings have been integrated into your Spaced Repetition schedule.</p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <button onclick="window.flashcardTrainer.initDeck('${this.filterMode}', ${this.chapterFilter})"
                    class="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
              Restart This Deck
            </button>
            <button onclick="window.app.showView('retention')"
                    class="px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium">
              View Retention Stats
            </button>
          </div>
        </div>
      `;
      return;
    }

    const card = this.getCurrentCard();
    const rec = window.srsEngine.getWordRecord(card.word, card.law);
    const boxNames = { 1: 'Box 1 (Fragile)', 2: 'Box 2 (Learning)', 3: 'Box 3 (Retained)', 4: 'Box 4 (Solid)', 5: 'Box 5 (Mastered)' };
    const progress = Math.round(((this.currentIndex) / this.deck.length) * 100);

    const example = card.examples && card.examples.length > 0 ? card.examples[0] : null;

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Deck Header & Filter Tabs -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Leitner Flashcard Trainer
            </span>
            <h2 class="text-2xl font-serif font-bold text-foreground">
              ${this.filterMode === 'chapter' ? `Law ${this.chapterFilter} Flashcards` : this.filterMode === 'due' ? 'Spaced Repetition Due Deck' : this.filterMode === 'stumble' ? 'Stumble Words Deck' : 'All 333 Vocabulary Words'}
            </h2>
          </div>

          <!-- Filter Selector -->
          <div class="flex flex-wrap gap-1 bg-muted p-1 rounded-xl text-xs font-medium">
            <button onclick="window.flashcardTrainer.initDeck('all')" class="px-3 py-1.5 rounded-lg ${this.filterMode === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
              All 333
            </button>
            <button onclick="window.flashcardTrainer.initDeck('chapter', window.bookReader.currentChapter)" class="px-3 py-1.5 rounded-lg ${this.filterMode === 'chapter' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
              Current Law (${window.bookReader.currentChapter})
            </button>
            <button onclick="window.flashcardTrainer.initDeck('due')" class="px-3 py-1.5 rounded-lg ${this.filterMode === 'due' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
              Due Today
            </button>
            <button onclick="window.flashcardTrainer.initDeck('stumble')" class="px-3 py-1.5 rounded-lg ${this.filterMode === 'stumble' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}">
              Stumble Words
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>Card ${this.currentIndex + 1} of ${this.deck.length}</span>
            <span>${progress}% Complete</span>
          </div>
          <div class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div class="bg-primary h-1.5 rounded-full transition-all" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- 3D Flip Card Container (Japanese Karuta Style) -->
        <div class="flashcard-container cursor-pointer select-none" onclick="window.flashcardTrainer.flipCard()">
          <div id="flashcard-inner" class="flashcard-inner ${this.isFlipped ? 'flipped' : ''}">
            
            <!-- Card Front (Karuta Face) -->
            <div class="flashcard-front p-8 sm:p-12 rounded bg-card border-2 border-border shadow-md flex flex-col justify-between items-center text-center relative">
              <div class="w-full flex items-center justify-between text-xs">
                <span class="archive-badge">札番号 № ${String(this.currentIndex + 1).padStart(3, '0')}</span>
                <span class="hanko-stamp text-[10px]">単語札</span>
                <span class="font-mono text-muted-foreground text-xs font-bold">
                  Law ${card.law} • ${boxNames[rec.box] || 'Box 1'}
                </span>
              </div>

              <div class="my-auto py-8">
                <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-2">【 標題語 】 HEADWORD</div>
                <h3 class="text-4xl sm:text-6xl font-serif font-black text-foreground capitalize tracking-tight mb-4">
                  ${card.word}
                </h3>
                <button onclick="event.stopPropagation(); window.quizEngine.speakWord('${card.word}')" 
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-primary text-primary hover:bg-primary/10 transition-all text-xs font-mono font-bold">
                  🔊 音声発音 (Listen)
                </button>
              </div>

              <div class="text-xs text-muted-foreground font-serif opacity-75">
                ( 札をクリック、または空白キーで裏面の語義を確認 )
              </div>
            </div>

            <!-- Card Back (Karuta Definition & Context) -->
            <div class="flashcard-back p-8 sm:p-12 rounded bg-card border-2 border-primary/50 shadow-xl flex flex-col justify-between items-center text-center">
              <div class="w-full flex items-center justify-between text-xs pb-2 border-b border-dashed border-border/70">
                <div class="flex items-center gap-1.5">
                  <span class="hanko-circle text-xs">解</span>
                  <span class="font-serif font-bold text-foreground text-base capitalize">${card.word}</span>
                </div>
                <span class="text-primary font-mono text-xs">【 語義と文脈 】</span>
              </div>

              <div class="my-auto py-4 space-y-4 max-w-lg">
                <div class="p-4 rounded border border-border bg-secondary/30 text-foreground font-serif text-lg leading-relaxed font-medium">
                  "${card.definition}"
                </div>

                ${example ? `
                  <div class="p-3 rounded border-l-4 border-l-primary bg-muted/40 text-xs text-muted-foreground italic text-left leading-relaxed">
                    <span class="font-mono not-italic text-[10px] block text-primary font-bold mb-1">【 物語での文脈例 】:</span>
                    "${example}"
                  </div>
                ` : ''}

                ${card.confusable ? `
                  <div class="p-2.5 rounded border border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs text-left font-sans">
                    ⚠️ 混同注意: ${card.confusable}
                  </div>
                ` : ''}
              </div>

              <div class="text-[11px] font-mono text-muted-foreground">
                下の刻印ボタンで想起の難易度を格付けし、記憶定着度を更新
              </div>
            </div>

          </div>
        </div>

        <!-- Rating Woodblock Buttons (Active when flipped) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <button onclick="window.flashcardTrainer.rateCard('again')"
                  class="py-3 px-2 rounded border-2 border-rose-600/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-serif font-bold text-xs hover:bg-rose-500/20 transition-all text-center">
            <span class="block text-[10px] font-mono opacity-80">再学習 (Box 1)</span>
            【 壱・再考 】 Again (1)
          </button>
          
          <button onclick="window.flashcardTrainer.rateCard('hard')"
                  class="py-3 px-2 rounded border-2 border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-serif font-bold text-xs hover:bg-amber-500/20 transition-all text-center">
            <span class="block text-[10px] font-mono opacity-80">難渋 (Keep)</span>
            【 弐・難渋 】 Hard (2)
          </button>

          <button onclick="window.flashcardTrainer.rateCard('good')"
                  class="py-3 px-2 rounded border-2 border-blue-600/40 bg-blue-500/10 text-blue-800 dark:text-blue-300 font-serif font-bold text-xs hover:bg-blue-500/20 transition-all text-center">
            <span class="block text-[10px] font-mono opacity-80">合格 (+1 Box)</span>
            【 参・合格 】 Good (3)
          </button>

          <button onclick="window.flashcardTrainer.rateCard('easy')"
                  class="py-3 px-2 rounded border-2 border-emerald-600/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-serif font-bold text-xs hover:bg-emerald-500/20 transition-all text-center">
            <span class="block text-[10px] font-mono opacity-80">皆伝 (+2 Boxes)</span>
            【 四・極上 】 Easy (4)
          </button>
        </div>
      </div>
    `;
  }
}

window.flashcardTrainer = new FlashcardTrainer();

// Keyboard shortcuts for flashcards
window.addEventListener('keydown', (e) => {
  const fcView = document.getElementById('view-flashcards');
  if (fcView && !fcView.classList.contains('hidden')) {
    if (e.code === 'Space') {
      e.preventDefault();
      window.flashcardTrainer.flipCard();
    } else if (e.key === '1') {
      window.flashcardTrainer.rateCard('again');
    } else if (e.key === '2') {
      window.flashcardTrainer.rateCard('hard');
    } else if (e.key === '3') {
      window.flashcardTrainer.rateCard('good');
    } else if (e.key === '4') {
      window.flashcardTrainer.rateCard('easy');
    }
  }
});
