import { gemini } from '@/lib/ai/gemini'
import { nanoid } from '@/lib/nanoid'
import { supabase } from '@/lib/supabaseClient'
import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import z from 'zod'

export const POST = async (request: Request) => {
	const body = await request.json()

	const parsed = z
		.object({
			difficulty: z.enum(['easy', 'medium', 'hard']),
		})
		.safeParse(body)

	if (!parsed.success) {
		return NextResponse.json({ success: false })
	}

	const { object } = await generateObject({
		model: gemini('gemini-2.5-pro'),
		schema: z.object({
			problem_text: z.string(),
			final_answer: z.number(),
			step_by_step_solution: z.array(z.string()),
		}),
		messages: [
			{
				role: 'system',
				content: `
					You are a mathematic teacher, you will be generating mathematic problems for primary 5 students.
					A Mathematic Syllabus will be as follow, you must generate questions within the syllabus.

					**NUMBER AND ALGEBRA**

					SUB-STRAND: WHOLE NUMBERS
					1. Numbers up to 10 million
					1.1 reading and writing numbers in numerals and in words
					2. Four Operations
					2.1 multiplying and dividing by 10, 100, 1000 and their multiples without calculator
					2.2 order of operations without calculator
					2.3 use of brackets without calculator

					SUB-STRAND: FRACTIONS
					1. Fraction and Division
					1.1 dividing a whole number by a whole number with quotient as a fraction
					1.2 expressing fractions as decimals
					2. Four Operations
					2.1 adding and subtracting mixed numbers
					2.2 multiplying a proper/improper fraction and a whole number without calculator
					2.3 multiplying a proper fraction and a proper/ improper fractions without calculator
					2.4 multiplying two improper fractions
					2.5 multiplying a mixed number and a whole number

					SUB-STRAND: DECIMALS
					1. Four Operations
					1.1 multiplying and dividing decimals (up to 3 decimal places) by 10, 100, 1000 and their multiples without
					calculator
					1.2 converting a measurement from a smaller unit to a larger unit in decimal form, and vice versa
						• kilometres and metres
						• metres and centimetres
						• kilograms and grams
						• litres and millilitres

					SUB-STRAND: PERCENTAGE
					1. Percentage
					1.1 expressing a part of a whole as a percentage
					1.2 use of %
					1.3 finding a percentage part of a whole
					1.4 finding discount, GST and annual interest

					SUB-STRAND: RATE
					1. Rate
					1.1 rate as the amount of a quantity per unit of another quantity
					1.2 finding rate, total amount or number of units given the other two quantities

					**MEASUREMENT AND GEOMETRY**

					SUB-STRAND: AREA AND VOLUME
					1. Area of Triangle
					1.1 concepts of base and height of a triangle
					1.2 area of triangle
					1.3 finding the area of composite figures made up of rectangles, squares and triangles
					2. Volume of Cube and Cuboid
					2.1 building solids with unit cubes
					2.2 measuring volume in cubic units, cm^3/m^3, excluding conversion between cm^3 and m^3
					2.3 drawing cubes and cuboids on isometric grid
					2.4 volume of a cube/cuboid
					2.5 finding the volume of liquid in a rectangular tank
					2.6 relationship between ℓ (or ml) with cm^3

					SUB-STRAND: GEOMETRY
					1. Angles
					1.1 angles on a straight line
					1.2 angles at a point
					1.3 vertically opposite angles
					1.4 finding unknown angles
					2. Triangle
					2.1 properties of
						• isosceles triangle
						• equilateral triangle
						• right-angled triangle
					2.2 angle sum of a triangle
					2.3 finding unknown angles without additional construction of lines
					3. Parallelogram, Rhombus and Trapezium
					3.1 properties of
						• parallelogram
						• rhombus
						• trapezium
					3.2 finding unknown angles without additional construction of lines
				`,
			},
			{
				role: 'user',
				content: [
					{
						text: 'Generate an random question from the syllabus',
						type: 'text',
					},
					{
						text: `Difficulty: ${parsed.data.difficulty}`,
						type: 'text',
					},
				],
			},
		],
	})

	const response = {
		sessionId: crypto.randomUUID(),
		...object,
	}

	try {
		const res = await supabase.from('math_problem_sessions').insert({
			id: response.sessionId,
			problem_text: response.problem_text,
			correct_answer: response.final_answer,
		})
		console.log(res)
	} catch (error) {
		console.log(error)
	}

	return new Response(JSON.stringify(response))
}
