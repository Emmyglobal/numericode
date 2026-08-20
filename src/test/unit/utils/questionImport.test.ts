import { describe, it, expect } from 'vitest'
import {
  parseQuestionsText, countObjective, toAssignmentQuestions, toQuizQuestions,
} from '@/utils/questionImport'

describe('questionImport', () => {
  describe('plain text', () => {
    it('parses lettered MCQ with an Answer key', () => {
      const qs = parseQuestionsText(
        [
          'Q: What is 2 + 2?',
          'A) 3',
          'B) 4',
          'C) 5',
          'D) 6',
          'Answer: B',
          '',
          'Q: Which planet is closest to the sun?',
          'A) Mars',
          'B) Mercury',
          'Answer: B',
        ].join('\n'),
        'txt'
      )
      expect(qs).toHaveLength(2)
      expect(qs[0].kind).toBe('mcq')
      expect(qs[0].options?.map(o => o.text)).toEqual(['3', '4', '5', '6'])
      expect(qs[0].options?.find(o => o.isCorrect)?.text).toBe('4')
      expect(qs[0].correctAnswer).toBe('b')
    })

    it('parses true/false questions', () => {
      const qs = parseQuestionsText('Water boils at 100°C.\nAnswer: True', 'txt')
      expect(qs[0].kind).toBe('true_false')
      expect(qs[0].correctAnswer).toBe('true')
    })
  })

  describe('parses JSON', () => {
    it('reads an array of MCQ objects with correctAnswer as a letter', () => {
      const json = JSON.stringify([
        { question: '2 + 2?', options: ['3', '4', '5'], correctAnswer: '4' },
        { question: 'Capital of France?', options: ['Rome', 'Paris'], correct: 1 },
      ])
      const qs = parseQuestionsText(json, 'json')
      expect(qs).toHaveLength(2)
      expect(qs[0].kind).toBe('mcq')
      expect(qs[0].options?.find(o => o.isCorrect)?.text).toBe('4')
      expect(countObjective(qs)).toBe(2)
    })
  })

  describe('parses CSV', () => {
    it('parses a header-driven CSV into objective questions', () => {
      const csv = [
        'question,option_a,option_b,option_c,correct',
        'What is 3 * 3?,6,9,12,9',
        'Water freezes at 0°C?,True,False,,True',
      ].join('\n')
      const qs = parseQuestionsText(csv, 'csv')
      expect(qs).toHaveLength(2)
      expect(qs[0].kind).toBe('mcq')
      expect(qs[0].options?.find(o => o.isCorrect)?.text).toBe('9')
    })
  })

  describe('mappers', () => {
    it('maps objective questions into assignment questions', () => {
      const imported = parseQuestionsText('Q: 2+2?\nA) 3\nB) 4\nAnswer: B', 'txt')
      const assignment = toAssignmentQuestions(imported)
      expect(assignment[0].type).toBe('mcq')
      expect(assignment[0].options).toEqual(['3', '4'])
      expect(assignment[0].correctOptionIndex).toBe(1)
    })

    it('maps objective questions into quiz questions with correct answers', () => {
      const imported = parseQuestionsText('Water boils at 100°C.\nAnswer: True', 'txt')
      const quiz = toQuizQuestions(imported)
      expect(quiz[0].questionType).toBe('true_false')
      expect(quiz[0].correctAnswer).toBe('true')
      expect(quiz[0].position).toBe(1)
    })
  })
})