import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QuizQuestion, QuizOption } from './quizData';

interface DnaQuizQuestionProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  questionOfLabel: string;
  onAnswer: (option: QuizOption) => void;
  selectedIndex: number | null;
}

export function DnaQuizQuestion({ question, questionIndex, totalQuestions, questionOfLabel, onAnswer, selectedIndex }: DnaQuizQuestionProps) {
  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-sm text-muted-foreground font-medium">
        {questionIndex + 1} {questionOfLabel} {totalQuestions}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
        {question.question}
      </h2>
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAnswer(option)}
            className={cn(
              "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
              "hover:border-primary/60 hover:bg-primary/5",
              selectedIndex === i
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-foreground"
            )}
          >
            <span className="font-medium">{String.fromCharCode(65 + i)}.</span>{' '}
            {option.text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
