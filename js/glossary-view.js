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
      <div class="max-w-6xl mx-auto space-y-6 font-serif">
        <!-- Header -->
        <div class="catalog-card p-6 sm:p-8 rounded border-2 border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="hanko-stamp text-[10px]">総覧</span>
              <span class="archive-badge">NAMAR VOCABULARY COMPENDIUM</span>
            </div>
            <h2 class="text-3xl font-serif font-black text-foreground">
              波間市文書庫・三百三十三語総覧
            </h2>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Gradify 高頻度語彙リスト全333項目。各見出し語は『影響力の代償』の本文中において5回以上の実例文脈とともに収蔵されています。
            </p>
          </div>
          <div class="text-xs font-mono text-muted-foreground bg-secondary/50 border border-border px-4 py-2 rounded">
            該当件数: <strong>${filtered.length}</strong> / 全 <strong>${allGlossary.length}</strong> 語
          </div>
        </div>

        <!-- Search & Filter Controls (Vintage Card Catalog Filter) -->
        <div class="catalog-card p-4 sm:p-6 rounded border border-border space-y-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Search Bar -->
            <div class="relative flex-1">
              <input type="text"
                     id="glossary-search-input"
                     value="${this.searchQuery}"
                     placeholder="語彙または定義を検索..."
                     oninput="window.glossaryView.onSearchChange(this.value)"
                     class="w-full pl-9 pr-4 py-2 rounded border border-border bg-background text-foreground text-xs sm:text-sm font-serif focus:outline-none focus:border-primary" />
              <span class="absolute left-3 top-2.5 text-xs text-muted-foreground">🔍</span>
            </div>

            <!-- Law Selector -->
            <select onchange="window.glossaryView.onLawChange(this.value)"
                    class="py-2 px-3 rounded border border-border bg-background text-foreground text-xs font-serif">
              <option value="all" ${this.selectedLaw === 'all' ? 'selected' : ''}>全二十七則 (All 27 Laws)</option>
              ${Array.from({ length: 27 }, (_, i) => i + 1).map(n => `
                <option value="${n}" ${this.selectedLaw == n ? 'selected' : ''}>第 ${n} 則 (Law ${n})</option>
              `).join('')}
            </select>

            <!-- Box Selector -->
            <select onchange="window.glossaryView.onBoxChange(this.value)"
                    class="py-2 px-3 rounded border border-border bg-background text-foreground text-xs font-serif">
              <option value="all" ${this.selectedBox === 'all' ? 'selected' : ''}>全記憶段階 (All Stages)</option>
              <option value="1" ${this.selectedBox === '1' ? 'selected' : ''}>壱の箱 (Box 1: 初見)</option>
              <option value="2" ${this.selectedBox === '2' ? 'selected' : ''}>弐の箱 (Box 2: 習学)</option>
              <option value="3" ${this.selectedBox === '3' ? 'selected' : ''}>参の箱 (Box 3: 定着)</option>
              <option value="4" ${this.selectedBox === '4' ? 'selected' : ''}>四の箱 (Box 4: 熟達)</option>
              <option value="5" ${this.selectedBox === '5' ? 'selected' : ''}>五の箱 (Box 5: 皆伝)</option>
            </select>
          </div>

          <!-- A-Z Alphabet Filter Strip -->
          <div class="flex flex-wrap items-center gap-1 pt-2 border-t border-dashed border-border/70 text-xs font-mono">
            <span class="text-muted-foreground font-bold mr-1">頭文字:</span>
            <button onclick="window.glossaryView.onLetterChange('all')"
                    class="px-2 py-0.5 rounded ${this.selectedLetter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary'}">
              ALL
            </button>
            ${alphabet.map(letter => `
              <button onclick="window.glossaryView.onLetterChange('${letter}')"
                      class="px-2 py-0.5 rounded ${this.selectedLetter === letter ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-secondary'}">
                ${letter}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Words Grid (Kyoto Library Slips) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${filtered.map(item => {
            const rec = window.srsEngine.getWordRecord(item.word, item.law);
            const boxKanji = { 1: '壱', 2: '弐', 3: '参', 4: '四', 5: '皆伝' }[rec.box] || '壱';
            const boxColors = {
              1: 'border-rose-600/40 text-rose-700 dark:text-rose-300',
              2: 'border-amber-600/40 text-amber-800 dark:text-amber-300',
              3: 'border-blue-600/40 text-blue-800 dark:text-blue-300',
              4: 'border-indigo-600/40 text-indigo-800 dark:text-indigo-300',
              5: 'border-emerald-600/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
            };

            return `
              <div class="catalog-card p-5 rounded border border-border hover:border-primary transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2 pb-1 border-b border-border/50">
                    <div class="flex items-center gap-2">
                      <h4 class="text-xl font-serif font-black text-foreground capitalize">${item.word}</h4>
                      <button onclick="window.quizEngine.speakWord('${item.word}')" class="text-xs text-primary hover:opacity-75 transition-opacity" title="Pronounce">
                        🔊
                      </button>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${boxColors[rec.box]}">
                      ${boxKanji}
                    </span>
                  </div>

                  <p class="text-xs sm:text-sm text-foreground/90 font-medium mb-3 leading-relaxed">
                    ${item.definition}
                  </p>

                  ${item.confusable ? `
                    <div class="text-[11px] p-2 rounded border border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 mb-3 font-sans">
                      ⚠️ ${item.confusable}
                    </div>
                  ` : ''}
                </div>

                <div class="pt-3 border-t border-dashed border-border/60 flex items-center justify-between text-xs font-mono">
                  <button onclick="window.app.openChapter(${item.law})" class="text-primary hover:underline font-bold">
                    Law ${item.law} 読本 →
                  </button>
                  <button onclick="window.bookReader.showWordModal('${item.word}')" class="px-2.5 py-1 rounded border border-border bg-secondary hover:bg-secondary/70 font-medium text-[11px]">
                    調書閲覧
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
