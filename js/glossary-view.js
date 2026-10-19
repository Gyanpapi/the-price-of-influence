// js/glossary-view.js - Interactive Directory for all 333 Vocabulary Words

class GlossaryView {
  constructor() {
    this.searchQuery = '';
    this.selectedLaw = 'all';
    this.selectedBox = 'all';
    this.selectedLetter = 'all';
  }

  render() {
    const container = document.getElementById('glossary-view-content');
    if (!container) return;

    const allGlossary = window.VOCAB_GLOSSARY;

    // Filter list
    let filtered = allGlossary.filter(item => {
      // Search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchesWord = item.word.toLowerCase().includes(q);
        const matchesDef = item.definition.toLowerCase().includes(q);
        if (!matchesWord && !matchesDef) return false;
      }

      // Law filter
      if (this.selectedLaw !== 'all' && item.law !== parseInt(this.selectedLaw, 10)) {
        return false;
      }

      // Box filter
      if (this.selectedBox !== 'all') {
        const rec = window.srsEngine.getWordRecord(item.word, item.law);
        if (rec.box !== parseInt(this.selectedBox, 10)) {
          return false;
        }
      }

      // Letter filter
      if (this.selectedLetter !== 'all') {
        if (!item.word.toLowerCase().startsWith(this.selectedLetter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    container.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-3xl font-serif font-bold text-foreground">
              Vocabulary Glossary (333 Entries)
            </h2>
            <p class="text-sm text-muted-foreground mt-1">
              Every headword from Gradify's High-Frequency list, practiced in 5 distinct contexts in The Price of Influence.
            </p>
          </div>
          <div class="text-xs text-muted-foreground bg-card border border-border px-4 py-2 rounded-xl">
            Showing <strong>${filtered.length}</strong> of <strong>${allGlossary.length}</strong> words
          </div>
        </div>

        <!-- Search & Filter Controls -->
        <div class="p-4 sm:p-6 rounded-2xl bg-card border border-border/70 space-y-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Search Bar -->
            <div class="relative flex-1">
              <input type="text"
                     id="glossary-search-input"
                     value="${this.searchQuery}"
                     placeholder="Search word or definition..."
                     oninput="window.glossaryView.onSearchChange(this.value)"
                     class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <svg class="w-5 h-5 text-muted-foreground absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <!-- Law Selector -->
            <select onchange="window.glossaryView.onLawChange(this.value)"
                    class="py-2.5 px-3 rounded-xl border border-border bg-background text-foreground text-sm">
              <option value="all" ${this.selectedLaw === 'all' ? 'selected' : ''}>All Laws (1–27)</option>
              ${Array.from({ length: 27 }, (_, i) => i + 1).map(n => `
                <option value="${n}" ${this.selectedLaw == n ? 'selected' : ''}>Law ${n}</option>
              `).join('')}
            </select>

            <!-- Box Selector -->
            <select onchange="window.glossaryView.onBoxChange(this.value)"
                    class="py-2.5 px-3 rounded-xl border border-border bg-background text-foreground text-sm">
              <option value="all" ${this.selectedBox === 'all' ? 'selected' : ''}>All Leitner Stages</option>
              <option value="1" ${this.selectedBox === '1' ? 'selected' : ''}>Box 1 (Fragile)</option>
              <option value="2" ${this.selectedBox === '2' ? 'selected' : ''}>Box 2 (Learning)</option>
              <option value="3" ${this.selectedBox === '3' ? 'selected' : ''}>Box 3 (Retained)</option>
              <option value="4" ${this.selectedBox === '4' ? 'selected' : ''}>Box 4 (Solid)</option>
              <option value="5" ${this.selectedBox === '5' ? 'selected' : ''}>Box 5 (Mastered)</option>
            </select>
          </div>

          <!-- A-Z Alphabet Filter Strip -->
          <div class="flex flex-wrap items-center gap-1 pt-2 border-t border-border/40 text-xs">
            <span class="text-muted-foreground font-semibold mr-1">Letter:</span>
            <button onclick="window.glossaryView.onLetterChange('all')"
                    class="px-2 py-1 rounded-md ${this.selectedLetter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'}">
              All
            </button>
            ${alphabet.map(letter => `
              <button onclick="window.glossaryView.onLetterChange('${letter}')"
                      class="px-2 py-1 rounded-md ${this.selectedLetter === letter ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'}">
                ${letter}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Words Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${filtered.map(item => {
            const rec = window.srsEngine.getWordRecord(item.word, item.law);
            const boxColors = {
              1: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
              2: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
              3: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
              4: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
              5: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            };

            return `
              <div class="p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                      <h4 class="text-xl font-serif font-bold text-foreground capitalize">${item.word}</h4>
                      <button onclick="window.quizEngine.speakWord('${item.word}')" class="p-1 text-primary hover:opacity-80 transition-opacity" title="Pronounce">
                        🔊
                      </button>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${boxColors[rec.box]}">
                      Box ${rec.box}
                    </span>
                  </div>

                  <p class="text-sm text-foreground/90 font-medium mb-3 leading-snug">
                    ${item.definition}
                  </p>

                  ${item.confusable ? `
                    <div class="text-[11px] p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 mb-3">
                      ⚠️ ${item.confusable}
                    </div>
                  ` : ''}
                </div>

                <div class="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <button onclick="window.app.openChapter(${item.law})" class="text-primary hover:underline font-semibold">
                    Law ${item.law} →
                  </button>
                  <button onclick="window.bookReader.showWordModal('${item.word}')" class="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  onSearchChange(val) {
    this.searchQuery = val;
    this.render();
  }

  onLawChange(val) {
    this.selectedLaw = val;
    this.render();
  }

  onBoxChange(val) {
    this.selectedBox = val;
    this.render();
  }

  onLetterChange(letter) {
    this.selectedLetter = letter;
    this.render();
  }
}

window.glossaryView = new GlossaryView();
