import { RSU } from '@/types/rsu';
import axios from 'axios';

export async function getRSU(): Promise<RSU[]> {
	const { data } = await axios.get('http://localhost:8000/rsu');
	if (!data) return [];
	const rsu_array = data.map((rsu: any) => {
		const { id, heartbeat, name, location } = rsu;
		return { id, heartbeat, name, location };
	});
	return rsu_array;
}

export async function updateRSU(id: string, payload: {}) {
	const { status } = await axios.post(
		`http://localhost:8000/rsu/${id}`,
		payload,
		{
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);
	return status;
}
