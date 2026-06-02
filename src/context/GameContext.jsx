import { createContext, useState, useCallback, useRef } from 'react'
import { getQuestionSet } from '../engines/questionEngine.js'
import { generateClientSessionId } from '../lib/game.js'

export const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [results, setResults] = useState(null)
  const [gameState, setGameState] = useState('idle') // idle | playing | finished
  const [answers, setAnswers] = useState([])
  const startTimeRef = useRef(null)
  const sessionIdRef = useRef(null)
  // ref 同步最新值，解决 setTimeout 闭包捕获旧状态的问题
  const answersRef = useRef([])
  const maxComboRef = useRef(0)

  const startGame = useCallback(
    ({ unit, wordProgressMap, unlockedWords, learnedWords }) => {
      const qs = getQuestionSet({
        unit,
        wordProgressMap: wordProgressMap || {},
        unlockedWords: unlockedWords || [],
        learnedWords: learnedWords || [],
      })
      setQuestions(qs)
      setCurrentIndex(0)
      setScore(0)
      setCombo(0)
      setMaxCombo(0)
      setResults(null)
      setAnswers([])
      answersRef.current = []
      maxComboRef.current = 0
      setGameState('playing')
      startTimeRef.current = Date.now()
      sessionIdRef.current = generateClientSessionId()
    },
    []
  )

  const submitAnswer = useCallback(
    (questionIndex, isCorrect) => {
      const q = questions[questionIndex]
      if (!q) return

      const newCombo = isCorrect ? combo + 1 : 0
      const newMaxCombo = Math.max(maxComboRef.current, newCombo)

      setCombo(newCombo)
      setMaxCombo(newMaxCombo)
      maxComboRef.current = newMaxCombo
      if (isCorrect) setScore((s) => s + 1)

      const responseTime = startTimeRef.current
        ? Date.now() - startTimeRef.current
        : 0

      const answer = {
        questionIndex,
        wordId: q.wordId,
        word: q.word,
        correct: isCorrect,
        type: q.type,
        responseTime,
      }
      const newAnswers = [...answersRef.current, answer]
      answersRef.current = newAnswers
      setAnswers(newAnswers)

      return { newCombo, newMaxCombo, answer }
    },
    [questions, combo]
  )

  const resetGame = useCallback(() => {
    setQuestions([])
    setCurrentIndex(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setResults(null)
    setAnswers([])
    answersRef.current = []
    maxComboRef.current = 0
    setGameState('idle')
    startTimeRef.current = null
    sessionIdRef.current = null
  }, [])

  const nextQuestion = useCallback(() => {
    const currentAnswers = answersRef.current
    const currentMaxCombo = maxComboRef.current
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      startTimeRef.current = Date.now()
    } else {
      setGameState('finished')
      const isPerfect = currentAnswers.every((a) => a.correct) && currentAnswers.length === questions.length
      setResults({
        totalQuestions: questions.length,
        correctCount: currentAnswers.filter((a) => a.correct).length,
        wrongCount: currentAnswers.filter((a) => !a.correct).length,
        maxCombo: currentMaxCombo,
        isPerfect,
        answers: currentAnswers,
        sessionId: sessionIdRef.current,
      })
    }
  }, [currentIndex, questions.length])

  const currentQuestion = questions[currentIndex] || null

  return (
    <GameContext.Provider
      value={{
        questions,
        currentIndex,
        currentQuestion,
        score,
        combo,
        maxCombo,
        results,
        gameState,
        answers,
        startGame,
        submitAnswer,
        nextQuestion,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
