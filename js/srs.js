// js/srs.js - Spaced Repetition System (SRS) & Cumulative Retention Engine

class SRSEngine {
  constructor() {
    this.STORAGE_KEY = 'price_of_influence_srs_data_v1';
    this.data = this.loadData();
  }

  // Load state from localStorage or initialize defaults
  loadData() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load SRS state from localStorage', e);
    }

    return {
      // Word stats keyed by lowercase word
      words: {},
      // Chapter completion & reading records keyed by chapter number
      chapters: {},
      // Streak and general stats
      stats: {
        totalReviews: 0,
        correctReviews: 0,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        xp: 0
      },
      // Bookmarks & notes
      bookmarks: [],
      notes: {}
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save SRS state', e);
    }
  }

  // Initialize word tracking if not present
  getWordRecord(word, lawNum = 1) {
    const key = word.toLowerCase();
    if (!this.data.words[key]) {
      this.data.words[key] = {
        word: key,
        law: lawNum,
        box: 1, // Leitner Box 1 to 5
        intervalDays: 1,
        lastReviewed: null,
        nextReviewDate: null,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
        mastered: false,
        stumble: false, // flagged as a weak word
        history: [] // { date, correct }
      };
    }
    return this.data.words[key];
  }

  // Record an answer result for a word
  recordReview(word, isCorrect, lawNum = 1) {
    const rec = this.getWordRecord(word, lawNum);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    rec.lastReviewed = now.toISOString();

    if (isCorrect) {
      rec.correctCount++;
      rec.streak++;
      rec.stumble = false;

      // Advance Leitner box (max 5)
      if (rec.box < 5) {
        rec.box++;
      }
      if (rec.box === 5) {
        rec.mastered = true;
      }

      this.data.stats.correctReviews++;
      this.data.stats.xp += 10;
    } else {
      rec.incorrectCount++;
      rec.streak = 0;
      rec.stumble = true;
      // Reset back to box 1 or drop by 1
      rec.box = 1;
      rec.mastered = false;
      this.data.stats.xp += 2;
    }

    // Set next review interval based on Leitner Box:
    // Box 1: 1 day, Box 2: 3 days, Box 3: 7 days, Box 4: 14 days, Box 5: 30 days
    const intervals = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
    rec.intervalDays = intervals[rec.box] || 1;

    const nextDate = new Date(now.getTime() + rec.intervalDays * 24 * 60 * 60 * 1000);
    rec.nextReviewDate = nextDate.toISOString();

    rec.history.push({
      date: now.toISOString(),
      correct: isCorrect,
      box: rec.box
    });

    if (rec.history.length > 20) {
      rec.history.shift();
    }

    this.data.stats.totalReviews++;
    this.updateStreak();
    this.saveData();

    return rec;
  }

  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const last = this.data.stats.lastActiveDate;

    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (last === yesterday) {
        this.data.stats.streakDays++;
      } else if (last < yesterday) {
        this.data.stats.streakDays = 1;
      }
      this.data.stats.lastActiveDate = today;
    }
  }

  // Mark chapter read
  markChapterRead(chapterNum) {
    if (!this.data.chapters[chapterNum]) {
      this.data.chapters[chapterNum] = {
        read: false,
        readCount: 0,
        firstRead: null,
        lastRead: null,
        quizzesTaken: 0,
        bestQuizScore: 0
      };
    }
    const c = this.data.chapters[chapterNum];
    c.read = true;
    c.readCount++;
    const now = new Date().toISOString();
    if (!c.firstRead) c.firstRead = now;
    c.lastRead = now;
    this.saveData();
  }

  isChapterRead(chapterNum) {
    return Boolean(this.data.chapters[chapterNum]?.read);
  }

  recordChapterQuizScore(chapterNum, scorePercent) {
    if (!this.data.chapters[chapterNum]) {
      this.markChapterRead(chapterNum);
    }
    const c = this.data.chapters[chapterNum];
    c.quizzesTaken++;
    if (scorePercent > (c.bestQuizScore || 0)) {
      c.bestQuizScore = scorePercent;
    }
    this.saveData();
  }

  // Check if a word is due for review today
  isWordDue(word) {
    const rec = this.getWordRecord(word);
    if (!rec.lastReviewed) return true; // never reviewed
    if (!rec.nextReviewDate) return true;
    return new Date(rec.nextReviewDate) <= new Date();
  }

  // Get retention score (0 - 100%) for a specific law
  getLawRetentionScore(lawNum, lawWords) {
    if (!lawWords || lawWords.length === 0) return 0;
    let totalScore = 0;
    for (const w of lawWords) {
      const rec = this.getWordRecord(w, lawNum);
      if (!rec.lastReviewed) {
        totalScore += 0;
      } else {
        // Box 1: 20%, Box 2: 40%, Box 3: 65%, Box 4: 85%, Box 5: 100%
        const boxWeights = { 1: 20, 2: 45, 3: 70, 4: 85, 5: 100 };
        let base = boxWeights[rec.box] || 20;
        // penalty if stumble
        if (rec.stumble) base = Math.max(15, base - 25);
        // decay if overdue
        if (this.isWordDue(w) && rec.box < 5) {
          base = Math.max(20, base - 15);
        }
        totalScore += base;
      }
    }
    return Math.round(totalScore / lawWords.length);
  }

  // Get overall vocabulary retention stats
  getGlobalStats(allGlossary) {
    let masteredCount = 0;
    let learningCount = 0;
    let reviewDueCount = 0;
    let stumbleCount = 0;
    let unstudiedCount = 0;
    const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    allGlossary.forEach(g => {
      const rec = this.getWordRecord(g.word, g.law);
      if (!rec.lastReviewed) {
        unstudiedCount++;
        boxCounts[1]++;
      } else {
        boxCounts[rec.box]++;
        if (rec.box === 5) {
          masteredCount++;
        } else {
          learningCount++;
        }
        if (this.isWordDue(g.word)) {
          reviewDueCount++;
        }
        if (rec.stumble) {
          stumbleCount++;
        }
      }
    });

    const totalStudied = allGlossary.length - unstudiedCount;
    const overallRetention = totalStudied > 0 
      ? Math.round(((masteredCount * 100) + (learningCount * 50)) / allGlossary.length)
      : 0;

    return {
      totalWords: allGlossary.length,
      unstudiedCount,
      totalStudied,
      masteredCount,
      learningCount,
      reviewDueCount,
      stumbleCount,
      boxCounts,
      overallRetention,
      streak: this.data.stats.streakDays,
      xp: this.data.stats.xp,
      totalReviews: this.data.stats.totalReviews,
      accuracy: this.data.stats.totalReviews > 0
        ? Math.round((this.data.stats.correctReviews / this.data.stats.totalReviews) * 100)
        : 0
    };
  }

  // CUMULATIVE VOCABULARY SELECTION ENGINE:
  // For Chapter N test: selects current chapter words + cumulative spaced review from Chapters 1..(N-1)
  selectQuizWords(currentChapterNum, allChapters, totalQuestions = 12) {
    const currentLaw = allChapters.find(c => c.law === currentChapterNum);
    if (!currentLaw) return [];

    const currentWords = [...currentLaw.words];
    
    // If it's chapter 1, all questions are from chapter 1
    if (currentChapterNum === 1) {
      return currentWords.slice(0, totalQuestions).map(w => ({ word: w, law: 1, isCumulative: false }));
    }

    // For chapter N > 1:
    // ~60% current chapter words, ~40% cumulative review from prior chapters
    const currentCount = Math.min(currentWords.length, Math.ceil(totalQuestions * 0.6));
    const cumulativeCount = totalQuestions - currentCount;

    // Shuffle current words and take currentCount
    const shuffledCurrent = this.shuffleArray(currentWords).slice(0, currentCount).map(w => ({
      word: w,
      law: currentChapterNum,
      isCumulative: false
    }));

    // Gather candidate words from all unlocked/prior chapters (1 to currentChapterNum - 1)
    const priorCandidates = [];
    allChapters
      .filter(c => c.law < currentChapterNum)
      .forEach(c => {
        c.words.forEach(w => {
          const rec = this.getWordRecord(w, c.law);
          // Calculate urgency priority score:
          // Higher score = higher priority to review
          let urgency = 10;
          if (rec.stumble) urgency += 50; // missed previously!
          if (this.isWordDue(w)) urgency += 30; // overdue for spaced repetition!
          if (rec.box === 1) urgency += 20; // fragile memory
          if (rec.box === 2) urgency += 15;
          // random jitter so candidates vary
          urgency += Math.random() * 10;

          priorCandidates.push({
            word: w,
            law: c.law,
            urgency,
            isCumulative: true
          });
        });
      });

    // Sort prior candidates by urgency descending
    priorCandidates.sort((a, b) => b.urgency - a.urgency);

    const selectedPrior = priorCandidates.slice(0, cumulativeCount);

    // Combine and shuffle the final quiz question list
    const combined = [...shuffledCurrent, ...selectedPrior];
    return this.shuffleArray(combined);
  }

  // Get words for a dedicated "Spiral Retention Workout" across all unlocked chapters
  selectRetentionWorkoutWords(maxUnlockedLaw, allChapters, count = 15) {
    const pool = [];
    allChapters
      .filter(c => c.law <= maxUnlockedLaw)
      .forEach(c => {
        c.words.forEach(w => {
          const rec = this.getWordRecord(w, c.law);
          let urgency = 10;
          if (rec.stumble) urgency += 50;
          if (this.isWordDue(w)) urgency += 35;
          if (rec.box <= 2) urgency += 20;
          if (!rec.lastReviewed) urgency += 10;
          urgency += Math.random() * 15;

          pool.push({ word: w, law: c.law, urgency, isCumulative: c.law < maxUnlockedLaw });
        });
      });

    pool.sort((a, b) => b.urgency - a.urgency);
    return pool.slice(0, count);
  }

  // Get all stumble/weak words
  getStumbleWords(allGlossary) {
    return allGlossary.filter(g => {
      const rec = this.getWordRecord(g.word, g.law);
      return rec.stumble || (rec.incorrectCount > 0 && rec.box <= 2);
    });
  }

  // Reset or export/import
  exportProgressJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importProgressJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.words && parsed.stats) {
        this.data = parsed;
        this.saveData();
        return true;
      }
    } catch (e) {
      console.error('Invalid progress JSON', e);
    }
    return false;
  }

  resetAllProgress() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.data = this.loadData();
    this.saveData();
  }

  shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// Global instance
window.srsEngine = new SRSEngine();
