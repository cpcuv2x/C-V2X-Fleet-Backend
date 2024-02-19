export type RSU = {
	id: string
	heartbeat: heartbeat
}

type heartbeat = {
	status: string
	connected_OBU: string[]
}
