// js/quiz.js - Interactive Quiz Engine with Cumulative Retention System

class QuizEngine {
  constructor() {
    this.currentQuiz = null;
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.audioContext = null;
  }

  // Web Audio API chimes
  playTone(type) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'incorrect') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(164.81, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'fanfare') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.frequency.value = freq;
          noteGain.gain.setValueAtTime(0.18, now + i * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
          noteOsc.start(now + i * 0.1);
          noteOsc.stop(now + i * 0.1 + 0.35);
        });
      }
    } catch (e) {
      // Audio might be blocked by browser policy before first user touch
    }
  }

  // Text-To-Speech pronunciation helper
  speakWord(word) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  // Build a test for a specific Chapter (with cumulative review included)
  createChapterQuiz(chapterNum, totalQuestions = 12) {
    const allChapters = window.BOOK_CHAPTERS;
    const allGlossary = window.VOCAB_GLOSSARY;

    // Use SRS Engine to intelligently pick questions (current law + prior laws)
    const selectedPlan = window.srsEngine.selectQuizWords(chapterNum, allChapters, totalQuestions);

    const questions = selectedPlan.map(item => {
      const gItem = allGlossary.find(g => g.word.toLowerCase() === item.word.toLowerCase());
      return this.generateQuestion(item.word, gItem, item.law, item.isCumulative, chapterNum);
    });

    this.currentQuiz = {
      mode: 'chapter',
      title: `Law ${chapterNum}: Mastery & Retention Test`,
      chapterNum,
      questions,
      totalCount: questions.length
    };
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    return this.currentQuiz;
  }

  // Build a test for Spiral Retention Workout (mix across all read chapters)
  createRetentionWorkoutQuiz(maxUnlockedLaw = 27, count = 15) {
    const allChapters = window.BOOK_CHAPTERS;
    const allGlossary = window.VOCAB_GLOSSARY;

    const selectedPlan = window.srsEngine.selectRetentionWorkoutWords(maxUnlockedLaw, allChapters, count);
    const questions = selectedPlan.map(item => {
      const gItem = allGlossary.find(g => g.word.toLowerCase() === item.word.toLowerCase());
      return this.generateQuestion(item.word, gItem, item.law, item.isCumulative, maxUnlockedLaw);
    });

    this.currentQuiz = {
      mode: 'retention_workout',
      title: `Spiral Retention Workout (Laws 1–${maxUnlockedLaw})`,
      chapterNum: maxUnlockedLaw,
      questions,
      totalCount: questions.length
    };
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    return this.currentQuiz;
  }

  // Build a test for Stumble Words only
  createStumbleQuiz() {
    const allGlossary = window.VOCAB_GLOSSARY;
    const stumbles = window.srsEngine.getStumbleWords(allGlossary);

    if (stumbles.length === 0) return null;

    const questions = stumbles.slice(0, 15).map(gItem => {
      return this.generateQuestion(gItem.word, gItem, gItem.law, true, 27);
    });

    this.currentQuiz = {
      mode: 'stumble_drill',
      title: `Weak Words Recovery Drill`,
      chapterNum: null,
      questions,
      totalCount: questions.length
    };
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    return this.currentQuiz;
  }

  // Generate a rich, diverse question for a target word
  generateQuestion(word, glossaryEntry, lawNum, isCumulative, currentChapterNum) {
    const allGlossary = window.VOCAB_GLOSSARY;
    const types = ['cloze', 'def_to_word', 'word_to_def'];
    
    // Check if we have an in-story example sentence
    const hasExample = glossaryEntry && glossaryEntry.examples && glossaryEntry.examples.length > 0;
    
    let chosenType;
    if (hasExample && Math.random() < 0.45) {
      chosenType = 'cloze';
    } else if (Math.random() < 0.5) {
      chosenType = 'word_to_def';
    } else {
      chosenType = 'def_to_word';
    }

    // Pick 3 distractors
    const distractors = this.pickDistractors(word, 3);
    const options = [word, ...distractors.map(d => d.word)];
    const shuffledOptions = window.srsEngine.shuffleArray(options);

    const definition = glossaryEntry ? glossaryEntry.definition : 'Definition unavailable';
    const example = hasExample ? glossaryEntry.examples[0] : null;

    if (chosenType === 'cloze' && example) {
      // Replace the target word in the sentence with a blank
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const blankedSentence = example.replace(regex, '________');

      return {
        type: 'cloze',
        word,
        law: lawNum,
        isCumulative,
        prompt: `Complete the sentence from the book:`,
        sentence: blankedSentence,
        originalSentence: example,
        correctAnswer: word,
        options: shuffledOptions,
        definition,
        confusable: glossaryEntry?.confusable || null
      };
    } else if (chosenType === 'def_to_word') {
      return {
        type: 'def_to_word',
        word,
        law: lawNum,
        isCumulative,
        prompt: `Which vocabulary word matches this definition?`,
        sentence: `"${definition}"`,
        originalSentence: example,
        correctAnswer: word,
        options: shuffledOptions,
        definition,
        confusable: glossaryEntry?.confusable || null
      };
    } else {
      // word_to_def: Options are definitions
      const defOptions = [
        definition,
        ...distractors.map(d => d.definition)
      ];
      const shuffledDefOptions = window.srsEngine.shuffleArray(defOptions);

      return {
        type: 'word_to_def',
        word,
        law: lawNum,
        isCumulative,
        prompt: `What is the correct meaning of "${word}"?`,
        sentence: example ? `Context from the story: "${example}"` : null,
        originalSentence: example,
        correctAnswer: definition,
        options: shuffledDefOptions,
        definition,
        confusable: glossaryEntry?.confusable || null
      };
    }
  }

  pickDistractors(targetWord, count = 3) {
    const allGlossary = window.VOCAB_GLOSSARY;
    const candidates = allGlossary.filter(g => g.word.toLowerCase() !== targetWord.toLowerCase());
    return window.srsEngine.shuffleArray(candidates).slice(0, count);
  }

  getCurrentQuestion() {
    if (!this.currentQuiz || this.currentIndex >= this.currentQuiz.questions.length) {
      return null;
    }
    return this.currentQuiz.questions[this.currentIndex];
  }

  submitAnswer(selectedOption) {
    const q = this.getCurrentQuestion();
    if (!q) return null;

    const isCorrect = (selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());

    if (isCorrect) {
      this.score++;
      this.playTone('correct');
    } else {
      this.playTone('incorrect');
    }

    // Update SRS state for the word
    const updatedRecord = window.srsEngine.recordReview(q.word, isCorrect, q.law);

    const result = {
      question: q,
      selected: selectedOption,
      isCorrect,
      correctAnswer: q.correctAnswer,
      updatedRecord,
      box: updatedRecord.box
    };

    this.answers.push(result);
    return result;
  }

  nextQuestion() {
    this.currentIndex++;
    return this.getCurrentQuestion();
  }

  isFinished() {
    return !this.currentQuiz || this.currentIndex >= this.currentQuiz.questions.length;
  }

  getSummary() {
    const total = this.currentQuiz ? this.currentQuiz.questions.length : 0;
    const accuracy = total > 0 ? Math.round((this.score / total) * 100) : 0;

    // Separate current chapter questions from cumulative previous chapter questions
    const currentChapterAnswers = this.answers.filter(a => !a.question.isCumulative);
    const cumulativeAnswers = this.answers.filter(a => a.question.isCumulative);

    const currentCorrect = currentChapterAnswers.filter(a => a.isCorrect).length;
    const cumulativeCorrect = cumulativeAnswers.filter(a => a.isCorrect).length;

    // Record chapter quiz score in SRS
    if (this.currentQuiz?.mode === 'chapter' && this.currentQuiz?.chapterNum) {
      window.srsEngine.recordChapterQuizScore(this.currentQuiz.chapterNum, accuracy);
    }

    if (accuracy >= 80) {
      this.playTone('fanfare');
    }

    return {
      title: this.currentQuiz?.title || 'Quiz Complete',
      mode: this.currentQuiz?.mode,
      chapterNum: this.currentQuiz?.chapterNum,
      total,
      score: this.score,
      accuracy,
      currentChapterAnswers,
      currentCorrect,
      currentTotal: currentChapterAnswers.length,
      cumulativeAnswers,
      cumulativeCorrect,
      cumulativeTotal: cumulativeAnswers.length,
      answers: this.answers,
      missedWords: this.answers.filter(a => !a.isCorrect).map(a => a.question.word)
    };
  }
}

// Global instance
window.quizEngine = new QuizEngine();
