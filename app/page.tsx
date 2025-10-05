'use client'

import { useState } from 'react'
import { AlertCircleIcon } from 'lucide-react'

interface MathProblem {
	problem_text: string
	final_answer: number
}

export default function Home() {
	const [problem, setProblem] = useState<MathProblem | null>(null)
	const [userAnswer, setUserAnswer] = useState('')
	const [feedback, setFeedback] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [sessionId, setSessionId] = useState<string | null>(null)
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
	const [generateProblemError, setGenerateProblemError] = useState('')
	const [submitProblemError, setSubmitProblemError] = useState('')

	const generateProblem = async () => {
		// TODO: Implement problem generation logic
		// This should call your API route to generate a new problem
		// and save it to the database
		setIsLoading(true)

		setGenerateProblemError('')
		setSubmitProblemError('')
		setFeedback('')
		setUserAnswer('')
		setProblem(null)
		setSessionId(null)

		try {
			const response = await fetch('/api/math-problem', {
				method: 'POST',
			})
			if (response.status === 200) {
				const data = await response.json()
				setProblem(data)
				setSessionId(data.sessionId)

				return
			}

			setGenerateProblemError(
				'Something went wrong when generating a new problem, please try again'
			)
		} catch (error) {
			setGenerateProblemError(
				'Something went wrong when generating a new problem, please try again'
			)
		} finally {
			setIsLoading(false)
		}
	}

	const submitAnswer = async (e: React.FormEvent) => {
		e.preventDefault()
		// TODO: Implement answer submission logic
		// This should call your API route to check the answer,
		// save the submission, and generate feedback

		setIsLoading(true)

		setGenerateProblemError('')
		setSubmitProblemError('')

		try {
			const response = await fetch('/api/math-problem/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					problem_text: problem?.problem_text || '',
					final_answer: problem?.final_answer || 0,
					answer: userAnswer,
					sessionId: sessionId,
				}),
			})
			if (response.status === 200) {
				const data = await response.json()
				setFeedback(data.feedback)
				setIsCorrect(!!data.isCorrect)

				return
			}

			setGenerateProblemError(
				'Something went wrong when generating a new problem, please try again'
			)
		} catch (error) {
			setGenerateProblemError(
				'Something went wrong when submitting solution, please try again'
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
			<main className='container mx-auto max-w-2xl px-4 py-8'>
				<h1 className='mb-8 text-center text-4xl font-bold text-gray-800'>
					Math Problem Generator
				</h1>

				<div className='mb-6 rounded-lg bg-white p-6 shadow-lg'>
					<button
						onClick={generateProblem}
						disabled={isLoading}
						className='w-full transform rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition duration-200 ease-in-out hover:scale-105 hover:bg-blue-700 disabled:bg-gray-400'>
						{isLoading ? 'Generating...' : 'Generate New Problem'}
					</button>
				</div>

				{problem && (
					<div className='mb-6 rounded-lg bg-white p-6 shadow-lg'>
						<h2 className='mb-4 text-xl font-semibold text-gray-700'>
							Problem:
						</h2>
						<p className='mb-6 text-lg leading-relaxed text-gray-800'>
							{problem.problem_text}
						</p>

						<form
							onSubmit={submitAnswer}
							className='space-y-4'>
							<div>
								<label
									htmlFor='answer'
									className='mb-2 block text-sm font-medium text-gray-700'>
									Your Answer:
								</label>
								<input
									type='number'
									id='answer'
									value={userAnswer}
									onChange={(e) =>
										setUserAnswer(e.target.value)
									}
									className='w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-transparent focus:ring-2 focus:ring-blue-500'
									placeholder='Enter your answer'
									required
								/>
							</div>

							<button
								type='submit'
								disabled={!userAnswer || isLoading}
								className='w-full transform rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition duration-200 ease-in-out hover:scale-105 hover:bg-green-700 disabled:bg-gray-400'>
								Submit Answer
							</button>
						</form>
					</div>
				)}

				{feedback && (
					<div
						className={`rounded-lg p-6 shadow-lg ${isCorrect ? 'border-2 border-green-200 bg-green-50' : 'border-2 border-yellow-200 bg-yellow-50'}`}>
						<h2 className='mb-4 text-xl font-semibold text-gray-700'>
							{isCorrect ? '✅ Correct!' : '❌ Not quite right'}
						</h2>
						<p className='leading-relaxed text-gray-800'>
							{feedback}
						</p>
					</div>
				)}

				{generateProblemError && (
					<div className='rounded-lg border-2 border-red-500 bg-red-200 p-6 text-gray-700 shadow-lg'>
						<h2 className='mb-4 flex items-center gap-2 text-xl font-semibold'>
							<AlertCircleIcon />
							Error
						</h2>
						<p className='leading-relaxed'>
							{generateProblemError}
						</p>
					</div>
				)}

				{submitProblemError && (
					<div className='rounded-lg border-2 border-red-500 bg-red-200 p-6 text-gray-700 shadow-lg'>
						<h2 className='mb-4 flex items-center gap-2 text-xl font-semibold'>
							<AlertCircleIcon />
							Error
						</h2>
						<p className='leading-relaxed'>{submitProblemError}</p>
					</div>
				)}
			</main>
		</div>
	)
}
