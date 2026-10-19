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

    const kanjiNums = ["〇", "壱", "弐", "参", "四", "五", "六", "七", "八", "九", "十", 
                       "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                       "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七"];

    const sectionKeys = [
      { id: 'scene', label: '1. The scene', kanji: '一・発端' },
      { id: 'price', label: '2. The price', kanji: '二・代償' },
      { id: 'countermove', label: '3. The countermove', kanji: '三・妙手' },
      { id: 'beyond', label: '4. Beyond the city', kanji: '四・応用' },
      { id: 'practice', label: '5. The law in practice', kanji: '五・実践' }
    ];

    const wordsList = chapter.words;

    // Retention health score for this chapter
    const retentionScore = window.srsEngine.getLawRetentionScore(chapterNum, wordsList);
    const retentionBadgeClass = retentionScore >= 80 ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300' : retentionScore >= 50 ? 'border-amber-700 text-amber-800 dark:text-amber-300' : 'border-rose-700 text-rose-800 dark:text-rose-300';

    let html = `
      <div class="chapter-header mb-10 pb-8 border-b-2 border-border/80 relative">
        <!-- Vintage Archive Registration Header Strip -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-dashed border-border/60 text-xs">
          <div class="flex items-center gap-2">
            <span class="archive-badge">ARCHIVE FILE № ${String(chapter.law).padStart(2, '0')}</span>
            <span class="hanko-stamp text-[10px]">波間記録</span>
            <span class="text-[11px] font-mono text-muted-foreground hidden sm:inline">NAMAR MUNICIPAL RECORD • VOL. XXVII</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="text-muted-foreground">RETENTION:</span>
            <span class="px-2 py-0.5 border rounded ${retentionBadgeClass} font-bold text-[11px]">
              ${retentionScore}% 定着
            </span>
          </div>
        </div>

        <!-- Law Title with Japanese Literary Nuance -->
        <div class="text-center sm:text-left mb-6">
          <div class="text-xs font-bold tracking-[0.25em] text-primary uppercase font-mono mb-2">
            【 第${kanjiNums[chapter.law] || chapter.law}則 】 LAW ${chapter.law} OF 27
          </div>
          <h1 class="text-3xl sm:text-5xl font-serif font-black text-foreground leading-tight tracking-tight mb-3">
            ${chapter.title}
          </h1>
          <p class="text-xs text-muted-foreground font-mono italic">
            Documented by Mira • Preserved in Soren's Archives • Namar Waterfront District
          </p>
        </div>

        <!-- Target Words Catalog Slip -->
        <div class="catalog-card p-4 sm:p-5 border border-border bg-card/60 mt-6">
          <div class="flex items-center justify-between mb-2 pb-2 border-b border-border/40 text-xs">
            <div class="font-bold tracking-wider text-muted-foreground flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary"></span>
              【 本則・指定語彙 】 TARGET HEADWORDS (${wordsList.length})
            </div>
            <span class="text-[10px] font-mono text-muted-foreground">Click word to inspect call slip</span>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            ${wordsList.map(w => {
              const rec = window.srsEngine.getWordRecord(w, chapter.law);
              const boxKanji = { 1: '壱', 2: '弐', 3: '参', 4: '四', 5: '皆伝' }[rec.box] || '壱';
              const boxClass = rec.box === 5 ? 'border-emerald-600/60 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-border text-foreground';
              return `
                <button class="word-chip text-xs transition-all hover:scale-105 ${boxClass}" 
                        onclick="window.bookReader.showWordModal('${w}')">
                  ${w}
                  <span class="ml-1 text-[10px] opacity-75 font-mono">(${boxKanji})</span>
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
        <section class="book-section mb-12">
          <div class="section-heading">
            <span class="text-xs font-bold font-mono px-2 py-0.5 bg-secondary text-secondary-foreground border border-border/70 rounded">
              ${sec.kanji}
            </span>
            <h2 class="text-xl font-serif font-bold text-foreground">
              ${sec.label}
            </h2>
          </div>
          <div class="section-content text-foreground/90 leading-loose space-y-4">
            <p>${highlightedText}</p>
          </div>
        </section>
      `;
    });

    // End of chapter action box (Vintage Library Check-out Stamp)
    html += `
      <div class="catalog-card mt-14 p-6 sm:p-10 border-2 border-border/80 text-center relative overflow-hidden">
        <div class="absolute top-3 right-3 opacity-20 dark:opacity-10 pointer-events-none">
          <div class="hanko-circle text-2xl w-20 h-20">検印</div>
        </div>

        <div class="inline-flex p-3 rounded-full border-2 border-primary text-primary mb-3">
          <span class="hanko-stamp text-sm">読了印</span>
        </div>
        <h3 class="text-2xl font-serif font-bold text-foreground mb-2">
          Finished Law ${chapter.law}: Ready for Inquiry?
        </h3>
        <p class="text-muted-foreground text-sm max-w-lg mx-auto mb-6 leading-relaxed">
          ${chapter.law > 1 ? `Test your comprehension now. This examination includes Law ${chapter.law} headwords <strong>plus cumulative spiral review from earlier laws</strong> to ensure permanent retention.` : `Lock in the foundational 12 headwords of Law 1 before entering the higher administrative courts.`}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button onclick="window.app.startChapterQuiz(${chapter.law})" 
                  class="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-serif font-bold shadow hover:bg-primary/90 transition-all flex items-center gap-2">
            <span>⚡ 筆記試験 (Take Law ${chapter.law} Test)</span>
          </button>
          
          <button onclick="window.app.startFlashcardsForChapter(${chapter.law})"
                  class="px-5 py-3 rounded-lg border border-border bg-card text-foreground font-serif font-medium hover:bg-secondary transition-all">
            🗂️ 単語札 (Flashcards)
          </button>

          ${chapter.law < 27 ? `
            <button onclick="window.bookReader.loadChapter(${chapter.law + 1})"
                    class="px-5 py-3 rounded-lg border border-border bg-secondary text-secondary-foreground hover:opacity-80 font-serif font-medium transition-all">
              次則 (Next Law ${chapter.law + 1}) →
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

    const boxKanji = { 1: '壱の箱 (初見 24h)', 2: '弐の箱 (修学 3d)', 3: '参の箱 (定着 7d)', 4: '四の箱 (熟達 14d)', 5: '皆伝 (Mastered 30d)' };

    popover.innerHTML = `
      <div class="catalog-card p-5 max-w-sm rounded border-2 border-border shadow-2xl relative bg-card text-foreground font-serif">
        <button onclick="document.getElementById('word-popover').classList.add('hidden')" class="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 text-xs font-mono">✕</button>
        
        <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-dashed border-border/60">
          <div class="flex items-center gap-2">
            <span class="hanko-stamp text-[10px]">語義札</span>
            <h4 class="text-xl font-serif font-black text-primary capitalize">${entry.word}</h4>
            <button onclick="window.quizEngine.speakWord('${entry.word}')" class="p-1 rounded text-primary hover:bg-primary/10 transition-colors" title="Listen Pronunciation">
              🔊
            </button>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 border border-border/80 rounded bg-secondary text-secondary-foreground font-bold">
            ${boxKanji[rec.box] || '壱の箱'}
          </span>
        </div>

        <div class="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">【 意味・定義 】</div>
        <p class="text-sm font-medium text-foreground mb-3 leading-relaxed">
          ${entry.definition}
        </p>

        ${entry.confusable ? `
          <div class="p-2.5 rounded border border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs mb-3 font-sans">
            <span class="font-bold">⚠️ 混同注意:</span> ${entry.confusable}
          </div>
        ` : ''}

        <div class="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50 font-mono">
          <span>Law ${entry.law} 語彙</span>
          <button onclick="window.bookReader.toggleWordMastery('${entry.word}')" class="text-primary hover:underline font-bold">
            ${rec.box === 5 ? '【 復習に戻す 】' : '【 皆伝印を押す ✓ 】'}
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
    if (left + 330 > window.innerWidth) {
      left = window.innerWidth - 340;
    }
    if (top + 220 > window.innerHeight) {
      top = rect.top - 200;
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

    const boxKanji = { 1: '壱の箱 (初見)', 2: '弐の箱 (修学)', 3: '参の箱 (定着)', 4: '四の箱 (熟達)', 5: '五の箱 (皆伝)' };

    modalContent.innerHTML = `
      <div class="vintage-frame p-6 sm:p-8 rounded bg-card text-foreground font-serif">
        <div class="flex items-start justify-between pb-4 mb-4 border-b-2 border-border/70">
          <div>
            <div class="flex items-center gap-3">
              <span class="hanko-circle text-xs">語</span>
              <h3 class="text-3xl sm:text-4xl font-serif font-black text-foreground capitalize">${entry.word}</h3>
              <button onclick="window.quizEngine.speakWord('${entry.word}')" class="px-2.5 py-1 rounded border border-primary text-primary hover:bg-primary/10 text-xs font-mono">
                🔊 発音
              </button>
            </div>
            <div class="text-xs font-mono text-muted-foreground mt-1 tracking-wider">
              NAMAR VOCABULARY ARCHIVE • LAW ${entry.law} HEADWORD
            </div>
          </div>
          <button onclick="document.getElementById('global-word-modal').classList.add('hidden')" class="p-1 text-muted-foreground hover:text-foreground text-sm font-mono">✕ 閉じる</button>
        </div>

        <div class="catalog-card p-4 border border-border bg-secondary/20 mb-4">
          <div class="text-xs font-bold font-mono text-primary uppercase tracking-widest mb-1">【 語義・本質 】 DEFINITION</div>
          <p class="text-base sm:text-lg text-foreground font-medium leading-relaxed">${entry.definition}</p>
        </div>

        ${entry.confusable ? `
          <div class="p-3 rounded border border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs sm:text-sm mb-4 font-sans">
            <span class="font-bold">⚠️ 識別要領 (Critical Distinction):</span> ${entry.confusable}
          </div>
        ` : ''}

        <div class="mb-4">
          <div class="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest mb-2">
            【 本文中での実例 】 5 CONTEXTUAL ENCOUNTERS IN NAMAR:
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            ${entry.examples.map((ex, i) => `
              <div class="p-3 rounded border border-border/60 bg-muted/30 text-xs sm:text-sm text-foreground/90 italic leading-relaxed border-l-4 border-l-primary">
                <span class="font-mono not-italic text-[10px] text-muted-foreground block mb-1">実例 0${i+1}:</span>
                "${ex}"
              </div>
            `).join('')}
          </div>
        </div>

        <div class="pt-4 border-t border-dashed border-border flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div class="text-muted-foreground">
            記憶段階: <strong class="text-foreground">${boxKanji[rec.box] || '壱の箱'}</strong> (${rec.correctCount} 正解 / ${rec.incorrectCount} 誤答)
          </div>
          <button onclick="window.bookReader.toggleWordMastery('${entry.word}'); document.getElementById('global-word-modal').classList.add('hidden');" 
                  class="px-4 py-2 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
            ${rec.box === 5 ? '初見段階に戻す' : '皆伝 (Mastered) に認定印を押す'}
          </button>
        </div>
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
