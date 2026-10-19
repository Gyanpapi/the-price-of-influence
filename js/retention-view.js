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
      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Hero Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-card border border-primary/20 shadow-xl">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground mb-3">
              <span>🧠 Spaced Repetition Engine</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Cumulative Memory & Retention Center
            </h2>
            <p class="text-muted-foreground text-sm max-w-xl mt-2">
              Our Leitner 5-stage algorithm and cumulative chapter quizzes guarantee you master new vocabulary while maintaining active recall of all previous chapters.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button onclick="window.app.startSpiralRetentionWorkout()"
                    class="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Quick Retention Workout (15 Qs)
            </button>
            ${stumbleWords.length > 0 ? `
              <button onclick="window.app.startStumbleDrill()"
                      class="px-5 py-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold hover:bg-rose-500/20 transition-all">
                Drill ${stumbleWords.length} Stumble Words
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl bg-card border border-border/60 shadow-sm">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Overall Retention</div>
            <div class="text-3xl font-extrabold text-primary flex items-baseline gap-2">
              ${stats.overallRetention}%
              <span class="text-xs font-normal text-muted-foreground">recalled</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
              <div class="bg-primary h-2 rounded-full transition-all duration-500" style="width: ${stats.overallRetention}%"></div>
            </div>
          </div>

          <div class="p-5 rounded-2xl bg-card border border-border/60 shadow-sm">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Due for Review</div>
            <div class="text-3xl font-extrabold ${stats.reviewDueCount > 0 ? 'text-amber-500' : 'text-emerald-500'}">
              ${stats.reviewDueCount}
            </div>
            <p class="text-xs text-muted-foreground mt-2">
              ${stats.reviewDueCount === 0 ? 'All caught up today! 🎉' : 'Words scheduled for recall'}
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-card border border-border/60 shadow-sm">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Permanent Mastery</div>
            <div class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${stats.masteredCount}
              <span class="text-xs font-normal text-muted-foreground">/ ${stats.totalWords}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-2">Reached Leitner Box 5</p>
          </div>

          <div class="p-5 rounded-2xl bg-card border border-border/60 shadow-sm">
            <div class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Study Streak & XP</div>
            <div class="text-3xl font-extrabold text-amber-500 flex items-center gap-2">
              🔥 ${stats.streak} <span class="text-xs font-bold text-primary">(${stats.xp} XP)</span>
            </div>
            <p class="text-xs text-muted-foreground mt-2">${stats.totalReviews} total practice reviews</p>
          </div>
        </div>

        <!-- Leitner Memory Pipeline (5 Boxes) -->
        <div class="p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 class="text-xl font-serif font-bold text-foreground">Leitner Spaced Repetition Pipeline</h3>
              <p class="text-sm text-muted-foreground">Words advance through 5 memory stages as you successfully recall them across spaced intervals.</p>
            </div>
            <button onclick="window.app.showView('flashcards')" class="text-sm text-primary hover:underline font-semibold">
              Open Interactive Flashcard Trainer →
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
            ${[
              { box: 1, title: 'Box 1: Fragile', interval: 'Every 24h', color: 'border-rose-400 bg-rose-500/5 text-rose-600 dark:text-rose-400' },
              { box: 2, title: 'Box 2: Learning', interval: 'Every 3 days', color: 'border-amber-400 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
              { box: 3, title: 'Box 3: Retained', interval: 'Every 7 days', color: 'border-blue-400 bg-blue-500/5 text-blue-600 dark:text-blue-400' },
              { box: 4, title: 'Box 4: Solid', interval: 'Every 14 days', color: 'border-indigo-400 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' },
              { box: 5, title: 'Box 5: Mastered', interval: 'Every 30 days', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
            ].map(b => `
              <div class="p-4 rounded-2xl border ${b.color} flex flex-col justify-between">
                <div>
                  <div class="text-xs font-bold uppercase tracking-wider opacity-80">${b.title}</div>
                  <div class="text-2xl font-bold mt-2">${stats.boxCounts[b.box] || 0}</div>
                  <div class="text-[11px] opacity-75 mt-0.5">words</div>
                </div>
                <div class="text-[10px] font-medium pt-3 mt-3 border-t border-current/20 opacity-80">
                  Interval: ${b.interval}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- The Ebbinghaus Forgetting Curve Explained -->
        <div class="p-6 sm:p-8 rounded-3xl bg-secondary/30 border border-border/50">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-2xl bg-primary/10 text-primary text-2xl hidden sm:block">
              📉
            </div>
            <div>
              <h4 class="text-lg font-serif font-bold text-foreground mb-1">
                How Our Cumulative System Beats the Forgetting Curve
              </h4>
              <p class="text-sm text-foreground/80 leading-relaxed mb-3">
                Hermann Ebbinghaus discovered that without active recall, humans forget up to <strong>70% of new words within 48 hours</strong>. 
                Our website solves this with <strong>automatic cumulative spiral reviews</strong>: every time you take a chapter test, the system deliberately weaves in words from past chapters that you are on the verge of forgetting, resetting your retention curve back to 100%.
              </p>
              <div class="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                <span class="inline-flex items-center gap-1 bg-background px-3 py-1 rounded-full border border-border">
                  ✓ Cumulative Chapter Quizzes
                </span>
                <span class="inline-flex items-center gap-1 bg-background px-3 py-1 rounded-full border border-border">
                  ✓ Priority Weak-Word Ingestion
                </span>
                <span class="inline-flex items-center gap-1 bg-background px-3 py-1 rounded-full border border-border">
                  ✓ 5 Contextual Encounters Per Law
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter by Chapter Retention Health Matrix -->
        <div class="p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 class="text-xl font-serif font-bold text-foreground">Chapter Retention Breakdown</h3>
              <p class="text-sm text-muted-foreground">Track your mastery level for each of the 27 Laws of Judgment.</p>
            </div>
            <div class="flex items-center gap-3 text-xs text-muted-foreground">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Solid (80%+)</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (50-79%)</span>
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Fragile (&lt;50%)</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${allChapters.map(ch => {
              const score = window.srsEngine.getLawRetentionScore(ch.law, ch.words);
              const isRead = window.srsEngine.isChapterRead(ch.law);
              const rec = window.srsEngine.data.chapters[ch.law];
              const badgeBg = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';

              return `
                <div class="p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-primary/50 transition-all flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Law ${ch.law}</span>
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-bold text-white ${badgeBg}">
                        ${score}% Retained
                      </span>
                    </div>
                    <h5 class="font-serif font-bold text-foreground text-base mb-1 line-clamp-1">${ch.title}</h5>
                    <div class="text-xs text-muted-foreground mb-3">${ch.words.length} headwords • ${isRead ? `Read (${rec?.quizzesTaken || 0} tests)` : 'Not yet read'}</div>
                    <div class="flex flex-wrap gap-1 mb-4">
                      ${ch.words.slice(0, 4).map(w => `<span class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground/80">${w}</span>`).join('')}
                      ${ch.words.length > 4 ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+${ch.words.length - 4} more</span>` : ''}
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-3 border-t border-border/40">
                    <button onclick="window.app.openChapter(${ch.law})" class="flex-1 px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted text-foreground transition-all">
                      Read Law
                    </button>
                    <button onclick="window.app.startChapterQuiz(${ch.law})" class="flex-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-all">
                      Test Retention
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Data Backup & Controls -->
        <div class="p-6 rounded-3xl bg-card border border-border/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 class="font-bold text-foreground text-base">Data & Progress Management</h4>
            <p class="text-xs text-muted-foreground">All your spaced repetition progress is saved safely in your browser.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button onclick="window.retentionDashboard.exportData()" class="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground">
              📥 Export Progress (JSON)
            </button>
            <button onclick="window.retentionDashboard.importDataPrompt()" class="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground">
              📤 Import Progress
            </button>
            <button onclick="window.retentionDashboard.confirmReset()" class="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10">
              Reset Progress
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
