// js/reader.js - Interactive Book Reader with Clickable Target Words & Narration

class BookReader {
  constructor() {
    this.currentChapter = 1;
    this.speechUtterance = null;
    this.isNarrating = false;
    this.settings = {
      theme: localStorage.getItem('poi_reader_theme') || 'parchment',
      fontSize: parseInt(localStorage.getItem('poi_font_size') || '18', 10),
      fontFamily: localStorage.getItem('poi_font_family') || 'serif'
    };
  }

  init() {
    this.applySettings();
    this.setupPopoverListener();
  }

  setTheme(theme) {
    this.settings.theme = theme;
    localStorage.setItem('poi_reader_theme', theme);
    this.applySettings();
  }

  setFontSize(size) {
    this.settings.fontSize = Math.min(26, Math.max(14, size));
    localStorage.setItem('poi_font_size', this.settings.fontSize);
    this.applySettings();
  }

  setFontFamily(family) {
    this.settings.fontFamily = family;
    localStorage.setItem('poi_font_family', family);
    this.applySettings();
  }

  applySettings() {
    const container = document.getElementById('reader-view');
    if (!container) return;

    // Remove existing theme classes
    container.className = container.className.replace(/\btheme-\S+/g, '');
    container.classList.add(`theme-${this.settings.theme}`);

    const article = document.getElementById('book-article');
    if (article) {
      article.style.fontSize = `${this.settings.fontSize}px`;
      if (this.settings.fontFamily === 'serif') {
        article.style.fontFamily = "'Merriweather', 'Georgia', 'Newsreader', serif";
      } else if (this.settings.fontFamily === 'sans') {
        article.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
      } else {
        article.style.fontFamily = "'Literata', serif";
      }
    }
  }

  loadChapter(chapterNum) {
    this.stopNarration();
    this.currentChapter = chapterNum;

    // Mark as read in SRS
    window.srsEngine.markChapterRead(chapterNum);

    const chapter = window.BOOK_CHAPTERS.find(c => c.law === chapterNum);
    if (!chapter) return;

    const container = document.getElementById('book-article');
    if (!container) return;

    // Highlight target words in each section
    const highlightedSections = {};
    const sectionKeys = [
      { id: 'scene', label: '1. The scene' },
      { id: 'price', label: '2. The price' },
      { id: 'countermove', label: '3. The countermove' },
      { id: 'beyond', label: '4. Beyond the city' },
      { id: 'practice', label: '5. The law in practice' }
    ];

    const wordsList = chapter.words;

    // Retention health score for this chapter
    const retentionScore = window.srsEngine.getLawRetentionScore(chapterNum, wordsList);
    const retentionBadgeClass = retentionScore >= 80 ? 'bg-emerald-500' : retentionScore >= 50 ? 'bg-amber-500' : 'bg-rose-500';

    let html = `
      <div class="chapter-header mb-8 pb-6 border-b border-border/40">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span class="text-xs font-bold tracking-widest uppercase text-accent-foreground/70 bg-accent/20 px-3 py-1 rounded-full">
            Law ${chapter.law} of 27
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-muted-foreground">Retention Health:</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${retentionBadgeClass}">
              ${retentionScore}%
            </span>
          </div>
        </div>

        <h1 class="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4 leading-tight">
          ${chapter.title}
        </h1>

        <div class="vocab-chips-bar mt-4 pt-4 border-t border-dashed border-border/40">
          <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Target Headwords (${wordsList.length} entries — click any to inspect):
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${wordsList.map(w => {
              const rec = window.srsEngine.getWordRecord(w, chapter.law);
              const boxLabel = rec.box === 5 ? 'Mastered' : `Box ${rec.box}`;
              const boxBadge = rec.box === 5 ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' : 'text-primary bg-primary/10 border-primary/20';
              return `
                <button class="word-chip px-2.5 py-1 text-xs rounded-md border font-medium transition-all hover:scale-105 ${boxBadge}" 
                        onclick="window.bookReader.showWordModal('${w}')">
                  ${w}
                  <span class="ml-1 opacity-70 text-[10px]">(${boxLabel})</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Render 5 sections with highlighted target words
    sectionKeys.forEach(sec => {
      const text = chapter.sections[sec.id] || '';
      const highlightedText = this.highlightWords(text, wordsList);
      html += `
        <section class="book-section mb-10">
          <h2 class="text-lg font-serif font-bold text-accent-foreground mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-accent"></span>
            ${sec.label}
          </h2>
          <div class="section-content text-foreground/90 leading-relaxed space-y-4">
            <p>${highlightedText}</p>
          </div>
        </section>
      `;
    });

    // End of chapter action box
    html += `
      <div class="end-chapter-box mt-12 p-6 sm:p-8 rounded-2xl bg-card border border-border/60 shadow-lg text-center">
        <div class="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-3">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-2xl font-serif font-bold text-foreground mb-2">
          Finished Reading Law ${chapter.law}?
        </h3>
        <p class="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
          Test your retention right now! ${chapter.law > 1 ? `This quiz includes Law ${chapter.law} words <strong>plus cumulative review from earlier laws</strong> so you never forget what you've learned.` : `This quiz tests all 12 target words from Law 1 to lock in your foundation.`}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button onclick="window.app.startChapterQuiz(${chapter.law})" 
                  class="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Take Law ${chapter.law} Mastery Test
          </button>
          
          <button onclick="window.app.startFlashcardsForChapter(${chapter.law})"
                  class="px-5 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all">
            Review Flashcards
          </button>

          ${chapter.law < 27 ? `
            <button onclick="window.bookReader.loadChapter(${chapter.law + 1})"
                    class="px-5 py-3 rounded-xl border border-border text-foreground hover:bg-muted font-medium transition-all">
              Next Law →
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.applySettings();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update bottom nav
    this.updateReaderNav();
  }

  highlightWords(text, words) {
    if (!words || words.length === 0) return text;
    // Single-pass regex prevents replacing attributes of already inserted spans
    const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
    return text.replace(regex, (match) => {
      return `<span class="vocab-target" data-word="${match.toLowerCase()}" tabindex="0">${match}</span>`;
    });
  }

  setupPopoverListener() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.vocab-target');
      if (target) {
        const word = target.getAttribute('data-word');
        if (word) {
          this.showWordPopover(word, target);
        }
      } else {
        // If clicked outside popover, dismiss
        const popover = document.getElementById('word-popover');
        if (popover && !e.target.closest('#word-popover')) {
          popover.classList.add('hidden');
        }
      }
    });
  }

  showWordPopover(word, element) {
    const allGlossary = window.VOCAB_GLOSSARY;
    const entry = allGlossary.find(g => g.word.toLowerCase() === word.toLowerCase());
    if (!entry) return;

    const rec = window.srsEngine.getWordRecord(word, entry.law);
    const popover = document.getElementById('word-popover');
    if (!popover) return;

    const boxNames = { 1: 'Box 1: Fragile', 2: 'Box 2: Learning', 3: 'Box 3: Retained', 4: 'Box 4: Solid', 5: 'Box 5: Mastered' };

    popover.innerHTML = `
      <div class="p-4 max-w-sm rounded-xl bg-popover text-popover-foreground border border-border shadow-2xl relative">
        <button onclick="document.getElementById('word-popover').classList.add('hidden')" class="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 text-sm">✕</button>
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <h4 class="text-xl font-bold font-serif capitalize text-primary">${entry.word}</h4>
            <button onclick="window.quizEngine.speakWord('${entry.word}')" class="p-1 rounded-full text-primary hover:bg-primary/10 transition-colors" title="Listen Pronunciation">
              🔊
            </button>
          </div>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${rec.box === 5 ? 'bg-emerald-500/20 text-emerald-600' : 'bg-primary/10 text-primary'}">
            ${boxNames[rec.box] || 'Box 1'}
          </span>
        </div>

        <p class="text-sm font-medium text-foreground/90 mb-3 leading-snug">
          ${entry.definition}
        </p>

        ${entry.confusable ? `
          <div class="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs mb-3">
            ⚠️ ${entry.confusable}
          </div>
        ` : ''}

        <div class="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span>Law ${entry.law} Vocabulary</span>
          <button onclick="window.bookReader.toggleWordMastery('${entry.word}')" class="text-primary hover:underline font-semibold">
            ${rec.box === 5 ? 'Reset to Learning' : 'Mark as Mastered ✓'}
          </button>
        </div>
      </div>
    `;

    // Position popover near clicked element
    const rect = element.getBoundingClientRect();
    popover.classList.remove('hidden');
    popover.style.position = 'fixed';
    
    // Check bounds
    let top = rect.bottom + 8;
    let left = rect.left;
    if (left + 320 > window.innerWidth) {
      left = window.innerWidth - 330;
    }
    if (top + 200 > window.innerHeight) {
      top = rect.top - 180;
    }

    popover.style.top = `${Math.max(10, top)}px`;
    popover.style.left = `${Math.max(10, left)}px`;
  }

  showWordModal(word) {
    const allGlossary = window.VOCAB_GLOSSARY;
    const entry = allGlossary.find(g => g.word.toLowerCase() === word.toLowerCase());
    if (!entry) return;

    const modal = document.getElementById('global-word-modal');
    if (!modal) return;

    const rec = window.srsEngine.getWordRecord(word, entry.law);
    const modalContent = document.getElementById('global-word-modal-content');

    modalContent.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div>
          <div class="flex items-center gap-3">
            <h3 class="text-3xl font-serif font-bold text-foreground capitalize">${entry.word}</h3>
            <button onclick="window.quizEngine.speakWord('${entry.word}')" class="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-lg">
              🔊 Speak
            </button>
          </div>
          <div class="text-sm text-muted-foreground mt-1">Law ${entry.law} Target Vocabulary</div>
        </div>
        <button onclick="document.getElementById('global-word-modal').classList.add('hidden')" class="p-2 text-muted-foreground hover:text-foreground text-xl">✕</button>
      </div>

      <div class="p-4 rounded-xl bg-card border border-border/60 mb-4">
        <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Definition:</div>
        <p class="text-base text-foreground font-medium">${entry.definition}</p>
      </div>

      ${entry.confusable ? `
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-sm mb-4">
          <span class="font-bold">⚠️ Critical Distinction:</span> ${entry.confusable}
        </div>
      ` : ''}

      <div class="mb-4">
        <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Encounters in The Price of Influence:</div>
        <div class="space-y-2">
          ${entry.examples.map(ex => `
            <div class="p-3 rounded-lg bg-muted/50 text-sm text-foreground/90 italic border-l-2 border-primary">
              "${ex}"
            </div>
          `).join('')}
        </div>
      </div>

      <div class="pt-4 border-t border-border flex items-center justify-between">
        <div class="text-xs text-muted-foreground">
          SRS Status: <strong>Box ${rec.box}</strong> (${rec.correctCount} correct / ${rec.incorrectCount} mistakes)
        </div>
        <button onclick="window.bookReader.toggleWordMastery('${entry.word}'); document.getElementById('global-word-modal').classList.add('hidden');" class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
          ${rec.box === 5 ? 'Demote to Box 1' : 'Mark as Mastered (Box 5)'}
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  toggleWordMastery(word) {
    const rec = window.srsEngine.getWordRecord(word);
    if (rec.box === 5) {
      rec.box = 1;
      rec.mastered = false;
    } else {
      rec.box = 5;
      rec.mastered = true;
    }
    window.srsEngine.saveData();
    this.loadChapter(this.currentChapter);
  }

  toggleNarration() {
    if (this.isNarrating) {
      this.stopNarration();
    } else {
      this.startNarration();
    }
  }

  startNarration() {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    const chapter = window.BOOK_CHAPTERS.find(c => c.law === this.currentChapter);
    if (!chapter) return;

    this.stopNarration();
    const fullText = `Law ${chapter.law}: ${chapter.title}. ` +
      Object.values(chapter.sections).join(' ');

    this.speechUtterance = new SpeechSynthesisUtterance(fullText);
    this.speechUtterance.rate = 0.95;
    this.speechUtterance.onend = () => {
      this.isNarrating = false;
      this.updateNarrateButton();
    };

    window.speechSynthesis.speak(this.speechUtterance);
    this.isNarrating = true;
    this.updateNarrateButton();
  }

  stopNarration() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isNarrating = false;
    this.updateNarrateButton();
  }

  updateNarrateButton() {
    const btn = document.getElementById('narrate-btn');
    if (!btn) return;
    if (this.isNarrating) {
      btn.innerHTML = '⏹ Stop Audio';
      btn.classList.add('bg-rose-500', 'text-white');
      btn.classList.remove('bg-secondary');
    } else {
      btn.innerHTML = '🎧 Listen Law';
      btn.classList.remove('bg-rose-500', 'text-white');
      btn.classList.add('bg-secondary');
    }
  }

  updateReaderNav() {
    const prevBtn = document.getElementById('reader-prev-btn');
    const nextBtn = document.getElementById('reader-next-btn');
    const titleSpan = document.getElementById('reader-chapter-indicator');

    if (titleSpan) {
      titleSpan.textContent = `Law ${this.currentChapter} of 27`;
    }
    if (prevBtn) {
      prevBtn.disabled = this.currentChapter <= 1;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentChapter >= 27;
    }
  }
}

window.bookReader = new BookReader();
