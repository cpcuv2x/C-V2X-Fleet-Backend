import { RSU } from "@/types/rsu"
import axios from "axios"

export async function getRSU(): Promise<RSU[]> {
	const { data } = await axios.get("http://127.0.0.1:8000/api/rsu")
	if (!data) return []
	const rsu_array = data.map((rsu: any) => {
		const { id, heartbeat } = JSON.parse(rsu)
		return { id, heartbeat }
	})
	console.log(rsu_array)
	return rsu_array
}

export async function updateRSU(id: string, payload: {}) {
	const { status } = await axios.put(
		`http://127.0.0.1:8000/api/rsu/${id}`,
		payload,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	)
	return status
}
