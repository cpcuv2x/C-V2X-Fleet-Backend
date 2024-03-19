import { Reporter } from '@/types/reporter';
import axios from './axios';

export async function getReporter(): Promise<Reporter[]> {
	const { data } = await axios.get(`reporter`);
	if (!data) return [];
	return [data];
}

type payload = {
	incident: string;
};

export async function updateReporter(payload: payload) {
	const data = await getReporter();
	if (payload.incident && !data[0]['location']) {
		console.error('No location found');
		return 400;
	}
	const { status } = await axios.post(`reporter`, payload);
	return status;
}
