import { OBU } from '@/types/obu';
import axios from 'axios';

export async function getOBU(): Promise<OBU[]> {
	const { data } = await axios.get('http://localhost:8000/obu');
	if (!data) return [];
	const obu_array = data.map((obu: any) => {
		const { id, speed, heartbeat } = obu[1];
		return { id, speed, heartbeat };
	});
	console.log('obu_array', obu_array);
	return obu_array;
}

export async function updateOBU(id: string, payload: {}) {
	const { status } = await axios.post(
		`http://localhost:8000/obu/${id}`,
		payload,
		{
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);
	return status;
}
