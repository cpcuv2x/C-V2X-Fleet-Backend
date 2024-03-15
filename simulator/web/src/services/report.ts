import { Reporter } from '@/types/reporter';
import axios from './axios';

export async function getReporter(): Promise<Reporter[]> {
	const { data } = await axios.get(`reporter`);
	if (!data) return [];
	return [data];
}

export async function updateReporter(payload: {}) {
	const { status } = await axios.post(`reporter`, payload);
	return status;
}
