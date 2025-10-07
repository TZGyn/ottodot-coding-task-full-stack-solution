'use client'

import { useEffect, useState } from 'react'
import { AlertCircleIcon, Divide, Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MathProblem {
	problem_text: string
	final_answer: number
}

export default function Home() {
	const [problem, setProblem] = useState<MathProblem | null>(null)
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
		'easy'
	)
	const [stepByStepSolution, setStepByStepSolution] = useState<string[]>([])
	const [showSolution, setShowSolution] = useState<boolean>(false)
	const [userAnswer, setUserAnswer] = useState('')
	const [feedback, setFeedback] = useState('')
	const [hint, setHint] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGeneratingSolution, setIsGeneratingSolution] = useState(false)
	const [sessionId, setSessionId] = useState<string | null>(null)
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
	const [generateProblemError, setGenerateProblemError] = useState('')
	const [submitProblemError, setSubmitProblemError] = useState('')
	const [generateSolutionError, setGenerateSolutionError] = useState('')

	const [problemHistory, setProblemHistory] = useState<
		{
			id: string
			problem_text: string
			correct_answer: number
			submissions: {
				is_correct: boolean
			}[]
		}[]
	>([])

	const getHistory = async () => {
		try {
			const response = await fetch('/api/history')

			if (response.status === 200) {
				const data = await response.json()

				setProblemHistory(data.history)
			}
		} catch (error) {}
	}

	useEffect(() => {
		getHistory()
	}, [])

	const generateProblem = async () => {
		// TODO: Implement problem generation logic
		// This should call your API route to generate a new problem
		// and save it to the database
		setIsLoading(true)

		setGenerateProblemError('')
		setSubmitProblemError('')
		setFeedback('')
		setHint('')
		setStepByStepSolution([])
		setShowSolution(false)
		setUserAnswer('')
		setProblem(null)
		setSessionId(null)

		try {
			const response = await fetch('/api/math-problem', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					difficulty,
				}),
			})
			if (response.status === 200) {
				const data = await response.json()
				setProblem(data)
				setSessionId(data.sessionId)
				setStepByStepSolution(data.step_by_step_solution)

				getHistory()

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

		setIsSubmitting(true)

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
				setHint(data.hint)
				setIsCorrect(!!data.isCorrect)

				getHistory()

				return
			}

			setGenerateProblemError(
				'Something went wrong when submitting solution, please try again'
			)
		} catch (error) {
			setGenerateProblemError(
				'Something went wrong when submitting solution, please try again'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const getSolution = async () => {
		setIsGeneratingSolution(true)
		try {
			if (stepByStepSolution.length > 0) {
				setShowSolution(!showSolution)
				return
			}
			const response = await fetch('/api/math-problem/solution', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					problem_text: problem?.problem_text || '',
					final_answer: problem?.final_answer || 0,
				}),
			})

			if (response.status === 200) {
				const data = await response.json()
				setStepByStepSolution(data.step_by_step_solution)
				setShowSolution(true)

				return
			}

			setGenerateSolutionError(
				'Something went wrong when generating a new problem, please try again'
			)
		} catch (error) {
			setGenerateSolutionError(
				'Something went wrong when generating a new problem, please try again'
			)
		} finally {
			setIsGeneratingSolution(false)
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
			<main className='container mx-auto max-w-2xl px-4 py-8'>
				<h1 className='mb-8 text-center text-4xl font-bold text-gray-800'>
					Math Problem Generator
				</h1>

				<div className='mb-6 flex flex-col items-center gap-2 rounded-lg bg-white p-6 shadow-lg sm:flex-row'>
					<select
						name='difficulty'
						id='difficulty'
						value={difficulty}
						onChange={(e) =>
							setDifficulty(
								e.target.value as 'easy' | 'medium' | 'hard'
							)
						}
						className='w-full rounded-lg border border-gray-500 px-4 py-3 text-gray-800 sm:max-w-fit'>
						<option value='easy'>Easy</option>
						<option value='medium'>Medium</option>
						<option value='hard'>Hard</option>
					</select>
					<button
						onClick={generateProblem}
						disabled={isLoading || isSubmitting}
						className='flex w-full transform items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition duration-200 ease-in-out hover:scale-105 hover:bg-blue-700 disabled:bg-gray-400'>
						{isLoading && <Loader2Icon className='animate-spin' />}
						{isLoading ? 'Generating' : 'Generate New Problem'}
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
								disabled={
									!userAnswer || isLoading || isSubmitting
								}
								className='flex w-full transform items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition duration-200 ease-in-out hover:scale-105 hover:bg-green-700 disabled:bg-gray-400'>
								{isSubmitting && (
									<Loader2Icon className='animate-spin' />
								)}
								Submit Answer
							</button>
						</form>
					</div>
				)}

				{feedback && (
					<div
						className={`mb-6 rounded-lg p-6 shadow-lg ${isCorrect ? 'border-2 border-green-200 bg-green-50' : 'border-2 border-yellow-200 bg-yellow-50'}`}>
						<h2 className='mb-4 text-xl font-semibold text-gray-700'>
							{isCorrect ? '✅ Correct!' : '❌ Not quite right'}
						</h2>
						<p className='leading-relaxed text-gray-800'>
							{feedback}
						</p>
					</div>
				)}

				{hint && !isCorrect && (
					<div
						className={`mb-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 shadow-lg`}>
						<h2 className='mb-4 text-xl font-semibold text-gray-700'>
							{/* hint */}
							💡Hint
						</h2>
						<p className='leading-relaxed text-gray-800'>{hint}</p>
					</div>
				)}

				{problem && (
					<>
						<div className='p-6'>
							<button
								onClick={() => setShowSolution(!showSolution)}
								className='flex w-full transform items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition duration-200 ease-in-out hover:scale-105 hover:bg-blue-700 disabled:bg-gray-400'>
								Toggle Solution
							</button>
						</div>
						{showSolution &&
							stepByStepSolution.map((solution, index) => (
								<div
									key={index}
									className={`mb-6 rounded-lg border-2 bg-white p-6 shadow-lg`}>
									<h2 className='mb-4 text-xl font-semibold text-gray-700'>
										Step {index + 1}
									</h2>
									<p className='leading-relaxed text-gray-800'>
										{solution}
									</p>
								</div>
							))}
					</>
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

				{problemHistory.length > 0 && (
					<div className='mt-4 text-gray-800'>
						<div className='mb-4 text-center text-4xl font-bold'>
							Problem History
						</div>
						{problemHistory.map((problem, index) => (
							<div
								key={index}
								onClick={() => {
									setProblem({
										final_answer: problem.correct_answer,
										problem_text: problem.problem_text,
									})
									setSessionId(problem.id)
									setStepByStepSolution([])
								}}
								className={cn(
									'flex items-center justify-between gap-6 border-b py-2 hover:cursor-pointer hover:bg-gray-200',
									index === 0 && 'border-t'
								)}>
								<div className='line-clamp-1'>
									{problem.problem_text}
								</div>
								<div>
									<span className='text-green-500'>
										{
											problem.submissions.filter(
												(submission) =>
													submission.is_correct
											).length
										}
									</span>
									<span>/{problem.submissions.length}</span>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	)
}
