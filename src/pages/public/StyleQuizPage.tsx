import { QUIZ_QUESTIONS } from '../../features/quiz/data/questions'
import { useQuizStore } from '../../store/useQuizStore'
import { QuizStartScreen } from '../../features/quiz/components/QuizStartScreen'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { QuizQuestion } from '../../features/quiz/components/QuizQuestion'
import { QuizResultScreen } from '../../features/quiz/components/QuizResultScreen'

export function StyleQuizPage() {
  const { phase, currentQuestion, topMatches, startQuiz, answerQuestion, retakeQuiz } = useQuizStore()

  if (phase === 'start') {
    return <QuizStartScreen onStart={startQuiz} />
  }

  if (phase === 'result') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <QuizResultScreen topMatches={topMatches} onRetake={retakeQuiz} />
      </div>
    )
  }

  const question = QUIZ_QUESTIONS[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <QuizProgress current={currentQuestion} total={QUIZ_QUESTIONS.length} />
      <QuizQuestion
        question={question}
        onAnswer={(opt) => answerQuestion(opt, QUIZ_QUESTIONS.length)}
      />
    </div>
  )
}
