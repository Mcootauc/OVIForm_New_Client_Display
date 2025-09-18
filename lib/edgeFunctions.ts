import { supabase } from '@/utils/supabase';

export async function getHospital() {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('User is not authenticated');
	}

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_SUPABASE_URL!}/functions/v1/get-hospital`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${session.access_token}`,
				apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
				'Content-Type': 'application/json',
			},
		}
	);

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.error || 'Failed to fetch hospital');
	}

	const data = await response.json();
	return data.hospital;
}
