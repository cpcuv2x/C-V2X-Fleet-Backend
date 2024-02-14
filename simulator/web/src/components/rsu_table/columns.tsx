import { ColumnDef } from '@tanstack/react-table';
import { RSU } from '@/types/rsu';

import Heartbeat from './heartbeat';
// import Connected_OBU from './connected_obu';
import Location from './location';

export const columns: ColumnDef<RSU>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'heartbeat',
		header: 'Heartbeat',
		cell: ({ row }) => {
			const id = row.getValue<string>('id');
			const status = row.getValue<any>('heartbeat');
			return <Heartbeat id={id} status={status} />;
		},
	},
	// {
	//     accessorKey: "connected_obu",
	//     header: "Connected OBU",
	//     cell: () => {
	//         return <Connected_OBU />
	//     }
	// }
	{
		accessorKey: 'location',
		header: 'Location',
		cell: ({ row }) => {
			const id = row.getValue<string>('id');
			return <Location id={id} />;
		},
	},
];
