// js/retention-view.js - Visual Retention Dashboard & Memory Analytics

class RetentionDashboard {
  render() {
    const container = document.getElementById('retention-view-content');
    if (!container) return;

    const allGlossary = window.VOCAB_GLOSSARY;
    const allChapters = window.BOOK_CHAPTERS;
    const stats = window.srsEngine.getGlobalStats(allGlossary);
    const stumbleWords = window.srsEngine.getStumbleWords(allGlossary);

    let html = `
      <div class="max-w-6xl mx-auto space-y-8 font-serif">
        <!-- Hero Header (Vintage Archive Ledger Banner) -->
        <div class="catalog-card p-6 sm:p-8 rounded border-2 border-border shadow-md">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="hanko-stamp text-[10px]">台帳管理</span>
                <span class="archive-badge">NAMAR MUNICIPAL RETENTION LEDGER</span>
              </div>
              <h2 class="text-3xl sm:text-4xl font-serif font-black text-foreground">
                波間市文書庫・記憶保持台帳
              </h2>
              <p class="text-xs sm:text-sm text-muted-foreground font-serif mt-1 max-w-xl leading-relaxed">
                忘却曲線を克服するための五段階分散復習（Leitner System）と累計回帰出題により、過去章の語彙を失念することなく恒久的な記憶定着を保証します。
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 font-serif">
              <button onclick="window.app.startSpiralRetentionWorkout()"
                      class="px-5 py-2.5 rounded bg-primary text-primary-foreground font-bold shadow hover:bg-primary/90 transition-all flex items-center gap-2 text-xs">
                <span>⚡ 累計回帰演習 (15問)</span>
              </button>
              ${stumbleWords.length > 0 ? `
                <button onclick="window.app.startStumbleDrill()"
                        class="px-5 py-2.5 rounded border border-rose-600/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-500/20 transition-all text-xs">
                  ⚠️ 要復習 ${stumbleWords.length} 語の集中演習
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Metric Grid (Vintage Ledger Indices) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="catalog-card p-5 rounded border border-border">
            <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">【 全体定着率 】 RETENTION</div>
            <div class="text-3xl font-extrabold font-mono text-primary flex items-baseline gap-2">
              ${stats.overallRetention}%
              <span class="text-[10px] font-normal text-muted-foreground font-serif">定着</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-1.5 mt-3 overflow-hidden border border-border/40">
              <div class="bg-primary h-1.5 rounded-full transition-all duration-500" style="width: ${stats.overallRetention}%"></div>
            </div>
          </div>

          <div class="catalog-card p-5 rounded border border-border">
            <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">【 本日復習対象 】 DUE TODAY</div>
            <div class="text-3xl font-extrabold font-mono ${stats.reviewDueCount > 0 ? 'text-amber-600' : 'text-emerald-600'}">
              ${stats.reviewDueCount} <span class="text-xs font-normal text-muted-foreground font-serif">語</span>
            </div>
            <p class="text-[11px] text-muted-foreground mt-2">
              ${stats.reviewDueCount === 0 ? '本日の復習は完了しています' : '本日記憶間隔を迎えた語彙'}
            </p>
          </div>

          <div class="catalog-card p-5 rounded border border-border">
            <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">【 皆伝認定 】 MASTERED</div>
            <div class="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
              ${stats.masteredCount}
              <span class="text-xs font-normal text-muted-foreground">/ ${stats.totalWords}</span>
            </div>
            <p class="text-[11px] text-muted-foreground mt-2">五の箱（30日間隔）達成</p>
          </div>

          <div class="catalog-card p-5 rounded border border-border">
            <div class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">【 連続修学日数 】 STREAK</div>
            <div class="text-3xl font-extrabold font-mono text-amber-600 flex items-center gap-2">
              ${stats.streak} <span class="text-xs font-serif font-bold text-primary">日 (${stats.xp} 経験点)</span>
            </div>
            <p class="text-[11px] text-muted-foreground mt-2">累計 ${stats.totalReviews} 回の復習試問</p>
          </div>
        </div>

        <!-- Leitner Memory Pipeline (5 Boxes in Japanese Archive Style) -->
        <div class="catalog-card p-6 sm:p-8 rounded border-2 border-border shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-dashed border-border/70">
            <div>
              <div class="flex items-center gap-2">
                <span class="hanko-circle text-xs">箱</span>
                <h3 class="text-xl font-serif font-black text-foreground">五段階・記憶定着格付け体系 (Leitner Boxes)</h3>
              </div>
              <p class="text-xs text-muted-foreground mt-1">正解を重ねるごとに次の箱へと進み、復習の間隔が伸びて長期記憶へと移行します。</p>
            </div>
            <button onclick="window.app.showView('flashcards')" class="text-xs text-primary hover:underline font-bold font-serif">
              単語札で特訓する →
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
            ${[
              { box: 1, kanji: '壱の箱', title: '初見 (Fragile)', interval: '24時間毎', color: 'border-rose-600/40 bg-rose-500/5 text-rose-700 dark:text-rose-300' },
              { box: 2, kanji: '弐の箱', title: '習学 (Learning)', interval: '3日毎', color: 'border-amber-600/40 bg-amber-500/5 text-amber-800 dark:text-amber-300' },
              { box: 3, kanji: '参の箱', title: '定着 (Retained)', interval: '7日毎', color: 'border-blue-600/40 bg-blue-500/5 text-blue-800 dark:text-blue-300' },
              { box: 4, kanji: '四の箱', title: '熟達 (Solid)', interval: '14日毎', color: 'border-indigo-600/40 bg-indigo-500/5 text-indigo-800 dark:text-indigo-300' },
              { box: 5, kanji: '五の箱', title: '皆伝 (Mastered)', interval: '30日毎', color: 'border-emerald-600/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' }
            ].map(b => `
              <div class="p-4 rounded border-2 ${b.color} flex flex-col justify-between">
                <div>
                  <div class="text-[11px] font-mono font-bold uppercase tracking-wider opacity-80">${b.kanji} • ${b.title}</div>
                  <div class="text-2xl font-bold font-mono mt-2">${stats.boxCounts[b.box] || 0}</div>
                  <div class="text-[10px] opacity-75 font-serif mt-0.5">登録語彙</div>
                </div>
                <div class="text-[10px] font-mono pt-3 mt-3 border-t border-current/20 opacity-80">
                  出題周期: ${b.interval}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- The Ebbinghaus Forgetting Curve Explained -->
        <div class="vintage-frame p-6 sm:p-8 rounded bg-card border border-border shadow-sm">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded border border-primary text-primary hidden sm:block">
              <span class="hanko-circle text-lg w-10 h-10">図</span>
            </div>
            <div>
              <h4 class="text-lg font-serif font-bold text-foreground mb-1">
                【 忘却曲線の克服 】 HOW SPIRAL RETENTION LOCKS IN WORDS
              </h4>
              <p class="text-xs sm:text-sm text-foreground/85 leading-loose mb-3">
                ヘルマン・エビングハウスの忘却曲線によると、人は新たな単語を学んでも<strong>48時間以内に約7割を忘却</strong>します。
                当文書庫では、新しい章に進むたびに<strong>「過去章の語彙（特に想起が不完全な語）」を自動的に回帰出題</strong>し、記憶の忘却曲線を初期化して脳に永続的に刻み込みます。
              </p>
              <div class="flex flex-wrap gap-2 text-xs font-mono">
                <span class="border border-border px-2.5 py-1 rounded bg-secondary">
                  ✓ 新規学習と過去問の自動混合 (60:40)
                </span>
                <span class="border border-border px-2.5 py-1 rounded bg-secondary">
                  ✓ 誤答語彙の優先回帰システム
                </span>
                <span class="border border-border px-2.5 py-1 rounded bg-secondary">
                  ✓ 各語5回の文脈的遭遇
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter by Chapter Retention Health Matrix -->
        <div class="catalog-card p-6 sm:p-8 rounded border-2 border-border shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-dashed border-border/70">
            <div>
              <div class="flex items-center gap-2">
                <span class="hanko-stamp text-[10px]">全則</span>
                <h3 class="text-xl font-serif font-black text-foreground">各章（全二十七則）記憶定着状況</h3>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">章ごとの語彙保持率と学習履歴の総覧</p>
            </div>
            <div class="flex items-center gap-3 text-xs font-mono">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> 良好 (80%+)</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span> 要復習 (50-79%)</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span> 忘却警告 (&lt;50%)</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${allChapters.map(ch => {
              const score = window.srsEngine.getLawRetentionScore(ch.law, ch.words);
              const isRead = window.srsEngine.isChapterRead(ch.law);
              const rec = window.srsEngine.data.chapters[ch.law];
              const badgeBorder = score >= 80 ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300' : score >= 50 ? 'border-amber-600 text-amber-800 dark:text-amber-300' : 'border-rose-600 text-rose-800 dark:text-rose-300';

              return `
                <div class="catalog-card p-4 rounded border border-border bg-card hover:border-primary transition-all flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-2 pb-1 border-b border-border/50">
                      <span class="text-xs font-mono font-bold text-muted-foreground">LAW ${String(ch.law).padStart(2, '0')}</span>
                      <span class="px-2 py-0.5 rounded border ${badgeBorder} text-[10px] font-mono font-bold">
                        ${score}% 定着
                      </span>
                    </div>
                    <h5 class="font-serif font-bold text-foreground text-base mb-1 line-clamp-1">${ch.title}</h5>
                    <div class="text-[11px] font-mono text-muted-foreground mb-3">${ch.words.length} 語 • ${isRead ? `読了 (${rec?.quizzesTaken || 0}回 試問済)` : '未読'}</div>
                    <div class="flex flex-wrap gap-1 mb-4">
                      ${ch.words.slice(0, 4).map(w => `<span class="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-secondary/50 text-foreground">${w}</span>`).join('')}
                      ${ch.words.length > 4 ? `<span class="text-[10px] px-1.5 py-0.5 text-muted-foreground">+${ch.words.length - 4}</span>` : ''}
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-3 border-t border-border/50 font-serif text-xs">
                    <button onclick="window.app.openChapter(${ch.law})" class="flex-1 px-3 py-1.5 rounded border border-border text-foreground hover:bg-secondary font-medium transition-all">
                      読本
                    </button>
                    <button onclick="window.app.startChapterQuiz(${ch.law})" class="flex-1 px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-all">
                      筆記試問
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Data Backup & Controls -->
        <div class="catalog-card p-6 rounded border border-border flex flex-wrap items-center justify-between gap-4 font-serif">
          <div>
            <h4 class="font-bold text-foreground text-sm">【 学習記録の保存と復元 】 Data Backup & Export</h4>
            <p class="text-xs text-muted-foreground font-mono mt-0.5">すべての記憶定着度と正誤記録はブラウザ内に自動保管されています。</p>
          </div>
          <div class="flex flex-wrap gap-2 font-mono text-xs">
            <button onclick="window.retentionDashboard.exportData()" class="px-3 py-2 rounded border border-border hover:bg-secondary text-foreground font-bold">
              📥 記録出力 (Export JSON)
            </button>
            <button onclick="window.retentionDashboard.importDataPrompt()" class="px-3 py-2 rounded border border-border hover:bg-secondary text-foreground font-bold">
              📤 記録読込 (Import JSON)
            </button>
            <button onclick="window.retentionDashboard.confirmReset()" class="px-3 py-2 rounded border border-rose-500/40 text-rose-700 dark:text-rose-400 font-bold hover:bg-rose-500/10">
              全消去
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  exportData() {
    const json = window.srsEngine.exportProgressJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price_of_influence_progress_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importDataPrompt() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const success = window.srsEngine.importProgressJSON(evt.target.result);
          if (success) {
            alert('Progress successfully imported!');
            this.render();
          } else {
            alert('Invalid backup file. Please check the JSON format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  confirmReset() {
    if (confirm('Are you sure you want to reset all vocabulary mastery and quiz records? This cannot be undone.')) {
      window.srsEngine.resetAllProgress();
      this.render();
      alert('All progress has been reset.');
    }
  }
}

window.retentionDashboard = new RetentionDashboard();
