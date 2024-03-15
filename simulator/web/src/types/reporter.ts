export type Reporter = {
	heartbeat: string;
	location: string;
};

export enum Status {
	ACCIDENT = 'ACCIDENT',
	CLOSED_ROAD = 'CLOSED ROAD',
	CONSTRUCTION = 'CONSTRUCTION',
	TRAFFIC_CONGESTION = 'TRAFFIC CONGESTION',
}
