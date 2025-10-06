import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export const GET = async (request: Request) => {
	const problems = await supabase.from('math_problem_sessions').select()
	const submissions = await supabase.from('math_problem_submissions').select()

	const history =
		problems.data?.map((data) => ({
			...data,
			submissions:
				submissions.data?.filter(
					(submission) => submission.session_id === data.id
				) || [],
		})) || []

	return NextResponse.json({ history: history })
}
