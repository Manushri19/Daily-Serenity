import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Award, 
  MessageCircle, 
  PlayCircle, 
  User as UserIcon, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Plus,
  Mic,
  Send,
  Lock,
  Eye,
  AirVent,
  Search,
  Check,
  Brain,
  History,
  Activity,
  Loader2
} from 'lucide-react';

import { apiService } from './services/apiService';
import { youtubeService } from './services/youtubeService';
import { DAILY_QUESTIONS, WEEKLY_QUESTIONS, FREQUENCY_OPTIONS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, UserState, Badge, QuizResult, Message, VideoSnippet } from './types';

const INITIAL_SUMMARY = "The user is starting their CBT journey. They have expressed interest in mindfulness and grounding. No historical patterns established yet.";

const DEFAULT_USER_STATE: UserState = {
  name: 'Elena Rivers',
  bio: 'Finding peace in the little moments. 🌿 Yogi, reader, and matcha enthusiast.',
  avatar: 'https://picsum.photos/seed/elena/200/200',
  streak: 7,
  behaviouralSummary: INITIAL_SUMMARY,
  concerns: ['Anxiety Relief', 'Focus & Clarity'],
  conversationHistory: [],
  quizHistory: [],
  unlockedBadges: ['1', '2', '3', '4']
};

// --- Shared Components ---

const TopBar = ({ user, onProfileClick, setScreen, currentScreen }: { user: UserState, onProfileClick: () => void, setScreen: (s: Screen) => void, currentScreen: Screen }) => {
  const navItems = [
    { id: 'daily' as Screen, label: 'Daily', icon: Brain },
    { id: 'weekly' as Screen, label: 'Weekly', icon: Calendar },
    { id: 'badges' as Screen, label: 'Badges', icon: Award },
    { id: 'chat' as Screen, label: 'Chat', icon: MessageCircle },
    { id: 'videos' as Screen, label: 'Videos', icon: PlayCircle },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-panel shadow-sm px-4 md:px-10 py-4 flex justify-between items-center h-20 transition-all">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setScreen('daily')}>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary text-on-primary flex items-center justify-center soft-lift group-hover:rotate-6 transition-transform">
            <AirVent className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-primary">Daily Serenity</h1>
        </div>

        <nav className="hidden md:flex ml-10 items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-headline font-bold text-sm transition-all ${
                  isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full text-on-surface font-headline font-semibold text-sm shadow-sm ring-1 ring-white/50">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span>{user.streak} day streak</span>
        </div>
        
        <button 
          onClick={onProfileClick}
          className={`w-10 h-10 rounded-full overflow-hidden border-2 soft-lift transition-all hover:scale-110 active:scale-95 ${
            currentScreen === 'profile' ? 'border-primary ring-4 ring-primary/20' : 'border-surface-container-lowest'
          }`}
        >
          <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </button>
      </div>
    </header>
  );
};

const BottomNav = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => {
  const tabs = [
    { id: 'daily' as Screen, label: 'Daily', icon: Brain },
    { id: 'weekly' as Screen, label: 'Weekly', icon: Calendar },
    { id: 'badges' as Screen, label: 'Badges', icon: Award },
    { id: 'chat' as Screen, label: 'Chat', icon: MessageCircle },
    { id: 'videos' as Screen, label: 'Videos', icon: PlayCircle },
  ];

  return (
    <nav className="fixed bottom-0 w-full glass-panel rounded-t-[2rem] z-50 pt-3 pb-8 px-4 flex justify-around items-center soft-lift md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 px-5 py-2.5 rounded-[1.5rem] group ${
              isActive ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-110' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
            <span className="font-label text-[11px] font-semibold tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const ProgressBar = ({ current, total, label, sublabel }: { current: number, total: number, label: string, sublabel?: string }) => (
  <div className="w-full space-y-2 mb-10">
    <div className="flex justify-between items-center text-sm font-label text-on-surface-variant px-1 font-medium">
      <span>{label}</span>
      {sublabel && <span>{sublabel}</span>}
    </div>
    <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
      <motion.div 
        className="h-full rounded-full signature-gradient"
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  </div>
);

// --- Screen Components ---

const OnboardingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [selected, setSelected] = useState<string[]>(['Anxiety Relief', 'Focus & Clarity']);
  const goals = [
    'Anxiety Relief', 'Better Sleep', 'Stress Management', 
    'Focus & Clarity', 'Emotional Balance', 'Self-Esteem'
  ];

  const toggleGoal = (goal: string) => {
    setSelected(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto w-full px-6 md:px-12 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]"
    >
      <div className="w-full mb-12 text-center md:text-left flex flex-col items-center md:items-start">
        <h1 className="font-headline text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-on-surface mb-6 leading-[1.1] text-center md:text-left">
          What brings you <br className="hidden lg:block"/>here today?
        </h1>
        <p className="font-body text-lg sm:text-xl text-on-surface-variant leading-relaxed max-w-2xl text-center md:text-left opacity-80">
          Select the areas you'd like to focus on. We'll tailor your sanctuary to support these goals and help you find your center.
        </p>
      </div>

      <div className="w-full bg-surface-container-low rounded-3xl p-6 md:p-16 mb-12 relative overflow-hidden soft-lift border border-white/50 ring-1 ring-black/5">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-wrap gap-4">
          {goals.map(goal => {
            const isSelected = selected.includes(goal);
            return (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`px-6 py-3 rounded-full font-label text-base transition-all duration-300 flex items-center gap-2 ${
                  isSelected 
                  ? 'bg-primary text-on-primary shadow-[0_4px_12px_rgba(0,107,99,0.2)]' 
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span>{goal}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto sm:mt-0">
        <button className="w-full sm:w-auto px-8 py-4 rounded-full font-label font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
          Back
        </button>
        <button 
          onClick={onFinish}
          className="w-full sm:w-auto px-10 py-4 rounded-xl font-label font-bold text-lg text-on-primary signature-gradient shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group overflow-hidden"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.main>
  );
};

const DailyQuizScreen = ({ user, onUpdateUser }: { user: UserState, onUpdateUser: (u: UserState) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentQ = DAILY_QUESTIONS[currentStep];

  const handleNext = async (value: number) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (currentStep < DAILY_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      const vals = Object.values(newAnswers) as number[];
      const avgMood = vals.reduce((a, b) => a + b, 0) / DAILY_QUESTIONS.length;
      const date = new Date().toISOString();
      
      const enrichedContext = `${user.behaviouralSummary} \nDAILY LOG: ${date}. Average State Score: ${avgMood.toFixed(1)}/5. Breakdown: ${JSON.stringify(newAnswers)}`;
      
      const newQuizResult = {
        date,
        type: 'daily' as const,
        score: avgMood,
        maxScore: 5
      };

      try {
        const response = await apiService.query({
          message: `SYSTEM_LOG: User finished their 5-question daily behavioral check-in. Results: ${JSON.stringify(newAnswers)}. Average mood: ${avgMood.toFixed(1)}.`,
          behavioural_summary: enrichedContext,
          concerns: user.concerns,
          conversation_history: user.conversationHistory.slice(-5).map(({ role, content }) => ({ role, content })),
          cbt_context: ""
        });

        onUpdateUser({
          ...user,
          behaviouralSummary: response.updatedSummary,
          concerns: response.suggestedTags,
          quizHistory: [newQuizResult, ...user.quizHistory],
          streak: user.streak + 1
        });
        alert("Daily patterns synced with your CBT therapist.");
      } catch (error) {
        console.error("Sync failed:", error);
        onUpdateUser({
          ...user,
          quizHistory: [newQuizResult, ...user.quizHistory],
          streak: user.streak + 1
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto w-full px-6 pt-10 pb-20"
    >
      <div className="max-w-2xl mx-auto mb-10">
        <ProgressBar 
          current={currentStep + 1} 
          total={DAILY_QUESTIONS.length} 
          label={`Question ${currentStep + 1} of ${DAILY_QUESTIONS.length}`} 
          sublabel={currentQ.id.toUpperCase()} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <section className="bg-surface-container-low rounded-3xl p-8 md:p-12 soft-lift relative overflow-hidden border border-white/50 min-h-[400px] flex flex-col justify-center">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container opacity-30 rounded-full blur-3xl"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="relative z-10"
            >
              <h2 className="font-headline text-2xl md:text-4xl text-on-surface font-black tracking-tight leading-tight mb-16">
                {currentQ.question}
              </h2>
              
              <div className="flex justify-between items-center gap-2 md:gap-4">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    disabled={isSubmitting}
                    onClick={() => handleNext(val)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all ${
                      answers[currentQ.id] === val 
                      ? 'signature-gradient text-on-primary shadow-xl ring-4 ring-primary-container/30 scale-110' 
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/15 hover:scale-105'
                    } disabled:opacity-50`}
                  >
                    <span className="font-label font-bold text-xl">{val}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-8 font-headline text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-2 opacity-60">
                <span>{currentQ.minLabel}</span>
                <span>{currentQ.maxLabel}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {isSubmitting && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="font-headline font-black text-on-surface-variant uppercase tracking-widest text-sm">Syncing State...</p>
            </div>
          )}
        </section>

        <section className="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/60 shadow-sm">
          <h3 className="font-headline text-2xl font-black text-on-surface mb-8 tracking-tight uppercase text-sm">Vital Metrics</h3>
          <div className="space-y-8">
            <TrendBar label="Self-Awareness" value={Math.min(100, (user.quizHistory.length * 8) + 40)} color="bg-primary" />
            <TrendBar label="Pattern Consistency" value={Math.min(100, user.streak * 10)} color="bg-secondary" />
            <TrendBar label="CBT Engagement" value={Math.min(100, user.conversationHistory.length * 5 + 20)} color="bg-tertiary" />
          </div>

          <div className="mt-12 p-6 bg-primary-container/20 rounded-2xl border border-primary/10">
            <p className="text-on-surface-variant text-xs font-bold leading-relaxed italic opacity-80 uppercase tracking-tight">
              "Providing Gemini with structured data allows it to move beyond conversation history and into behavioral pattern recognition."
            </p>
          </div>
        </section>
      </div>
    </motion.main>
  );
};

const TrendBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div>
    <div className="flex justify-between text-sm font-label mb-2">
      <span className="text-on-surface font-semibold">{label}</span>
      <span className={`${color.replace('bg-', 'text-')} font-extrabold`}>{value}%</span>
    </div>
    <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
      <motion.div 
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.2 }}
      />
    </div>
  </div>
);

const WeeklyReflectionScreen = ({ user, onUpdateUser }: { user: UserState, onUpdateUser: (u: UserState) => void }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === WEEKLY_QUESTIONS.length;

  const handleSelect = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleComplete = async () => {
    if (!isComplete) return;
    setIsSubmitting(true);
    
    // Calculate clinical scores
    const phq9Score = WEEKLY_QUESTIONS.filter(q => q.category === 'PHQ-9')
      .reduce((acc, q) => acc + (answers[q.id] || 0), 0);
    const gad7Score = WEEKLY_QUESTIONS.filter(q => q.category === 'GAD-7')
      .reduce((acc, q) => acc + (answers[q.id] || 0), 0);
    
    const totalScore = phq9Score + gad7Score;
    const date = new Date().toISOString();
    
    // Severity Labeling
    let phqLabel = phq9Score >= 15 ? 'Severe' : phq9Score >= 10 ? 'Moderate' : 'Mild-None';
    let gadLabel = gad7Score >= 15 ? 'Severe' : gad7Score >= 10 ? 'Moderate' : 'Mild-None';

    const enrichedContext = `${user.behaviouralSummary} \nWEEKLY CLINICAL SCAN: ${date}. \nPHQ-9 (Depression): ${phq9Score} [${phqLabel}]. \nGAD-7 (Anxiety): ${gad7Score} [${gadLabel}].`;

    const newQuizResult = {
      date,
      type: 'weekly' as const,
      score: totalScore,
      maxScore: 63,
      label: `PHQ:${phqLabel} / GAD:${gadLabel}`
    };

    try {
      const response = await apiService.query({
        message: `SYSTEM_ALERT: Weekly Clinical Assessment finished. PHQ-9 Log: ${phq9Score}, GAD-7 Log: ${gad7Score}. Suggested clinical interpretation: PHQ is ${phqLabel}, GAD is ${gadLabel}. Please refine behavioral patterns based on this.`,
        behavioural_summary: enrichedContext,
        concerns: user.concerns,
        conversation_history: user.conversationHistory.slice(-5).map(({ role, content }) => ({ role, content })),
        cbt_context: ""
      });

      onUpdateUser({
        ...user,
        behaviouralSummary: response.updatedSummary,
        concerns: response.suggestedTags,
        quizHistory: [newQuizResult, ...user.quizHistory]
      });
      alert("Clinical analysis complete. Your therapist's context has been updated.");
    } catch (error) {
      console.error("Clinical sync failed:", error);
      onUpdateUser({
        ...user,
        quizHistory: [newQuizResult, ...user.quizHistory]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full px-6 pt-10 pb-40"
    >
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight mb-3">Clinical Scan</h2>
        <p className="text-on-surface-variant font-body leading-relaxed max-w-md mx-auto opacity-80 text-sm">
          Please answer based on the last 14 days. These metrics are used by your AI therapist to track progress in depression (PHQ-9) and anxiety (GAD-7) levels.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-16">
        <ProgressBar 
          current={answeredCount} 
          total={WEEKLY_QUESTIONS.length} 
          label="Progress" 
          sublabel={`${answeredCount}/${WEEKLY_QUESTIONS.length} Answered`} 
        />
      </div>

      <div className="space-y-12">
        <section>
          <h3 className="text-xl font-headline font-black text-secondary mb-8 flex items-center gap-3 border-b border-surface-container-highest pb-4">
            <Brain className="w-6 h-6" />
            Mood Assessment (PHQ-9)
          </h3>
          <div className="space-y-6">
            {WEEKLY_QUESTIONS.filter(q => q.category === 'PHQ-9').map((q, idx) => (
              <QuestionBlock 
                key={q.id}
                number={idx + 1}
                text={q.text}
                value={answers[q.id]}
                onSelect={(val) => handleSelect(q.id, val)}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-headline font-black text-tertiary mb-8 flex items-center gap-3 border-b border-surface-container-highest pb-4">
            <Activity className="w-6 h-6" />
            Anxiety Assessment (GAD-7)
          </h3>
          <div className="space-y-6">
            {WEEKLY_QUESTIONS.filter(q => q.category === 'GAD-7').map((q, idx) => (
              <QuestionBlock 
                key={q.id}
                number={idx + 10}
                text={q.text}
                value={answers[q.id]}
                onSelect={(val) => handleSelect(q.id, val)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-center mt-20 mb-10">
        <button 
          onClick={handleComplete}
          disabled={!isComplete || isSubmitting}
          className="signature-gradient text-on-primary rounded-2xl px-16 py-5 font-headline font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-40 disabled:scale-100 disabled:grayscale"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
          {isSubmitting ? 'Updating AI Profile...' : 'Sync Clinical Data'}
        </button>
      </div>
    </motion.main>
  );
};

interface QuestionBlockProps {
  number: number;
  text: string;
  value?: number;
  onSelect: (v: number) => void;
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({ number, text, value, onSelect }) => (
  <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-surface-container-high/50 soft-lift group transition-all">
    <p className="text-on-surface font-black text-lg leading-snug mb-8 opacity-90">{number}. {text}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {FREQUENCY_OPTIONS.map(opt => (
        <label 
          key={opt.label} 
          className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${
            value === opt.value 
            ? 'bg-primary/10 border-primary ring-1 ring-primary' 
            : 'border-outline-variant/20 hover:bg-surface-container-highest hover:border-outline-variant/40'
          }`}
        >
          <input 
            type="radio" 
            className="hidden" 
            checked={value === opt.value} 
            onChange={() => onSelect(opt.value)} 
          />
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            value === opt.value ? 'bg-primary border-primary' : 'border-outline-variant'
          }`}>
            {value === opt.value && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className={`ml-3 font-label text-sm font-bold ${value === opt.value ? 'text-primary' : 'text-on-surface-variant'}`}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  </div>
);

const BadgesScreen = () => {
  const badges: Badge[] = [
    { id: '1', title: 'First Steps', description: 'Completed your first session.', icon: '🌱', isUnlocked: true, colorClass: 'bg-primary-container' },
    { id: '2', title: '7 Day Streak', description: 'Consistency is key.', icon: '🔥', isUnlocked: true, colorClass: 'bg-tertiary-container' },
    { id: '3', title: 'Deep Dive', description: '10 deep breathing exercises.', icon: '🌊', isUnlocked: true, colorClass: 'bg-secondary-container' },
    { id: '4', title: 'Night Owl', description: '5 evening reflections.', icon: '🌙', isUnlocked: true, colorClass: 'bg-primary-container' },
    { id: '5', title: 'Mountain Peak', description: 'Reach 30 days continuous.', icon: '⛰️', isUnlocked: false, colorClass: 'bg-surface-dim' },
    { id: '6', title: 'Early Riser', description: '10 morning meditations.', icon: '☀️', isUnlocked: false, colorClass: 'bg-surface-dim' },
    { id: '7', title: 'Zen Master', description: '100 total sessions.', icon: '🧘', isUnlocked: false, colorClass: 'bg-surface-dim' },
  ];

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto w-full px-6 md:px-12 pt-8 pb-32"
    >
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl tracking-tight text-on-surface font-black mb-4">The Journey</h1>
          <p className="font-body text-on-surface-variant text-lg lg:text-xl max-w-xl opacity-80">Every session is a step forward. Celebrate your consistency and the small victories along the way.</p>
        </div>
        
        <div className="bg-surface-container-low rounded-[2rem] p-6 lg:p-8 flex items-center gap-8 md:gap-12 soft-lift border border-white/50 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="space-y-1 z-10">
            <h2 className="font-headline text-xl lg:text-2xl font-bold text-on-surface whitespace-nowrap">Achievement</h2>
            <p className="font-body text-on-surface-variant text-sm font-bold uppercase tracking-widest opacity-60">4 of 12 Rewards</p>
          </div>
          <div className="w-20 h-20 lg:w-24 lg:h-24 relative z-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-surface-container-highest stroke-[3]" />
              <motion.circle 
                cx="18" cy="18" r="16" fill="none" 
                className="stroke-primary stroke-[3]"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 67 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
            <span className="absolute text-base lg:text-lg font-black text-primary">33%</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {badges.map(badge => (
          <article key={badge.id} className={`bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 flex flex-col items-center text-center gap-6 soft-lift group relative overflow-hidden border border-white transition-all hover:bg-white/80 hover:shadow-xl ${!badge.isUnlocked ? 'grayscale opacity-40' : ''}`}>
            {!badge.isUnlocked && (
              <div className="absolute inset-0 flex justify-center items-center z-10">
                <div className="bg-on-surface/5 p-3 rounded-full backdrop-blur-sm">
                  <Lock className="w-5 h-5 text-on-surface/40" />
                </div>
              </div>
            )}
            <div className={`w-20 h-20 rounded-2xl ${badge.colorClass} flex items-center justify-center text-4xl shadow-sm transition-all group-hover:scale-110 group-hover:rotate-3 duration-500`}>
              {badge.icon}
            </div>
            <div>
              <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-widest">{badge.title}</h3>
              <p className="font-body text-on-surface-variant text-[11px] mt-2 font-bold leading-relaxed opacity-70 italic">"{badge.description}"</p>
            </div>
          </article>
        ))}
      </div>
    </motion.main>
  );
};

const VideosScreen = ({ user }: { user: UserState }) => {
  const [videos, setVideos] = useState<VideoSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      const results = await youtubeService.searchVideos(user.concerns.length > 0 ? user.concerns : ['mindfulness']);
      setVideos(results);
      setIsLoading(false);
    };
    fetchVideos();
  }, [user.concerns]);

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto w-full px-6 md:px-12 pt-8 pb-40"
    >
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight text-on-surface mb-6">Discovery</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed font-medium opacity-80">
          Personalized resources from YouTube based on your current focus areas: {user.concerns.join(', ')}.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="font-headline font-black text-on-surface-variant uppercase tracking-widest text-sm">Searching for resources...</p>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map(video => (
            <a 
              key={video.id} 
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer flex flex-col h-full bg-white/40 rounded-[2.5rem] p-4 transition-all hover:bg-white/80 hover:shadow-2xl border border-white/50"
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-5 soft-lift">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center text-primary shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300">
                    <PlayCircle className="w-8 h-8 fill-current" />
                  </div>
                </div>
              </div>
              <div className="px-2 flex flex-col flex-grow">
                <span className="text-[10px] font-black tracking-widest uppercase mb-3 text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                  {video.tagName}
                </span>
                <h3 className="text-xl font-headline font-black text-on-surface mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-on-surface-variant text-sm line-clamp-2 font-medium leading-relaxed opacity-70">
                  {video.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-surface-container-low rounded-[3rem] border border-white/50">
          <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-primary opacity-40" />
          </div>
          <h2 className="text-2xl font-headline font-black text-on-surface mb-4">No therapeutic videos found</h2>
          <p className="text-on-surface-variant max-w-sm mb-8 font-medium">
            This could be because your YouTube API key is missing. Please ensure you've added <code className="bg-surface-container-highest px-2 py-1 rounded text-primary">YOUTUBE_API_KEY</code> to your Secrets in the settings menu.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-headline font-bold hover:bg-primary-dim transition-all active:scale-95"
          >
            Refresh Library
          </button>
        </div>
      )}
    </motion.main>
  );
};

const ChatScreen = ({ user, onUpdateUser }: { user: UserState, onUpdateUser: (u: UserState) => void }) => {
  const [messages, setMessages] = useState<Message[]>(user.conversationHistory.length > 0 ? user.conversationHistory : [
    { role: 'assistant', content: 'Welcome to your private CBT sanctuary. I am here to help you navigate your thoughts and feelings. How are you feeling today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Warmup the service
    apiService.ping();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { 
      role: 'user', 
      content: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiService.query({
        message: input,
        behavioural_summary: user.behaviouralSummary,
        concerns: user.concerns,
        conversation_history: messages.slice(-10).map(({ role, content }) => ({ role, content })),
        cbt_context: ""
      });

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = [...messages, userMsg, assistantMsg];
      setMessages(updatedHistory);
      
      onUpdateUser({
        ...user,
        behaviouralSummary: response.updatedSummary,
        concerns: response.suggestedTags,
        conversationHistory: updatedHistory
      });
    } catch (error) {
      console.error("AI Service Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a small connection issue with the therapeutic cloud. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto w-full px-4 h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] flex flex-col relative pt-5"
    >
      <div className="flex justify-center mb-10 shrink-0">
        <span className="px-4 py-1 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-full uppercase tracking-widest shadow-sm ring-1 ring-white/50 border border-primary/10">Today, October 24th</span>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-8 pb-32 md:pb-40 scrollbar-hide px-2">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={idx} 
            className={`flex items-end gap-3 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full shrink-0 flex items-center justify-center soft-lift ${msg.role === 'ai' ? 'bg-primary-container text-primary' : 'bg-surface-container-high text-primary'}`}>
              {msg.role === 'ai' ? <Brain className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <UserIcon className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
            </div>
            <div className="flex flex-col gap-2">
              <div className={`shadow-sm rounded-t-3xl p-5 md:p-6 ${
                msg.role === 'assistant' 
                ? 'bg-surface-container-lowest text-on-surface rounded-br-3xl rounded-bl-none border border-surface-container-low shadow-[0_4px_20px_rgba(0,0,0,0.03)]' 
                : 'bg-primary text-on-primary rounded-bl-3xl rounded-br-none shadow-[0_10px_30px_rgba(0,107,99,0.15)]'
              }`}>
                <p className="leading-relaxed font-medium text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && msg.content.includes('Exercise') && (
                  <div className="mt-5 flex flex-wrap gap-2">
                      <button className="bg-surface-container-low hover:bg-surface-container-high py-2.5 px-5 rounded-xl text-sm font-bold text-primary transition-all flex items-center gap-2 border border-primary/10 hover:scale-105 active:scale-95">
                        <AirVent className="w-4 h-4" />
                        Start Box Breathing
                      </button>
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-tighter uppercase opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>{msg.time}</span>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-on-surface-variant ml-12">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Wellness Coach is typing...</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-0 w-full px-4 md:px-8 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-2xl p-3 md:p-4 rounded-[2rem] shadow-2xl border border-surface-container-low flex items-center gap-3 soft-lift ring-1 ring-white/50">
            <button className="hidden sm:flex w-11 h-11 items-center justify-center text-outline-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
              <Plus className="w-6 h-6" />
            </button>
            <div className="flex-grow">
              <input 
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant font-bold py-2 px-2 text-base md:text-lg" 
                placeholder="Type a message..." 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button className="w-11 h-11 flex items-center justify-center text-outline-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
               <Mic className="w-6 h-6" />
            </button>
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-primary-dim disabled:opacity-50 disabled:grayscale"
            >
              <Send className="w-6 h-6 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

const ProfileScreen = ({ user, setUser }: { user: UserState, setUser: (u: UserState) => void }) => {
  return (
    <motion.main 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto px-6 space-y-12 pt-5 pb-40"
    >
      <section className="space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest soft-lift">
              <img src={user.avatar} alt="Large Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white font-bold text-sm tracking-wider uppercase">Change</span>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="font-label text-xs font-black text-on-surface-variant uppercase tracking-widest px-1">Display Name</label>
            <input 
              className="w-full bg-surface-container-low text-on-surface rounded-DEFAULT px-5 py-4 border-none focus:ring-2 focus:ring-primary focus:outline-none font-bold shadow-sm"
              value={user.name}
              onChange={(e) => setUser({...user, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label text-xs font-black text-on-surface-variant uppercase tracking-widest px-1">Bio</label>
            <textarea 
              className="w-full bg-surface-container-low text-on-surface rounded-DEFAULT px-5 py-4 border-none focus:ring-2 focus:ring-primary focus:outline-none font-medium resize-none shadow-sm leading-relaxed" 
              rows={3}
              value={user.bio}
              onChange={(e) => setUser({...user, bio: e.target.value})}
            />
          </div>
          <button className="w-full signature-gradient text-on-primary rounded-xl py-5 font-headline font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
            Save Profile
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight px-1 uppercase">Your Journey Badges</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center text-center soft-lift border border-surface-container-low">
            <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner">🌱</div>
            <h3 className="font-headline font-black text-on-surface text-sm uppercase">First Sprout</h3>
            <p className="font-body text-[10px] text-on-surface-variant font-bold mt-1 uppercase">Complete 1 session</p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center text-center soft-lift border border-surface-container-low">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner">🔥</div>
            <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-tight">7 Day Streak</h3>
            <p className="font-body text-[10px] text-on-surface-variant font-bold mt-1 uppercase">A week of peace</p>
          </div>
        </div>
      </section>
    </motion.main>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('daily_serenity_user_state');
    return saved ? JSON.parse(saved) : DEFAULT_USER_STATE;
  });

  useEffect(() => {
    localStorage.setItem('daily_serenity_user_state', JSON.stringify(user));
  }, [user]);

  const handleUpdateUser = (updated: UserState) => {
    setUser(updated);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding': return <OnboardingScreen onFinish={() => setScreen('daily')} />;
      case 'daily': return <DailyQuizScreen user={user} onUpdateUser={handleUpdateUser} />;
      case 'weekly': return <WeeklyReflectionScreen user={user} onUpdateUser={handleUpdateUser} />;
      case 'badges': return <BadgesScreen />;
      case 'chat': return <ChatScreen user={user} onUpdateUser={handleUpdateUser} />;
      case 'videos': return <VideosScreen user={user} />;
      case 'profile': return <ProfileScreen user={user} setUser={handleUpdateUser} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container">
      {screen !== 'onboarding' && (
        <TopBar 
          user={user} 
          currentScreen={screen}
          onProfileClick={() => setScreen('profile')} 
          setScreen={setScreen}
        />
      )}
      
      <div className={screen !== 'onboarding' ? 'pt-24 pb-32 md:pb-10' : ''}>
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </div>

      {screen !== 'onboarding' && <BottomNav currentScreen={screen} setScreen={setScreen} />}
    </div>
  );
}
