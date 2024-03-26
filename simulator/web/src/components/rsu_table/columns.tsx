import { ColumnDef } from '@tanstack/react-table';
import { RSU } from '@/types/rsu';

import Heartbeat from './heartbeat';
// import Connected_OBU from './connected_obu';
import Location from './location';
import RowAction from './row_action';

export const columns: ColumnDef<RSU>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'name',
		header: 'Name',
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
			const location = row.getValue<string>('location');
			return <Location id={id} location={location} />;
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return <RowAction id={row.getValue<string>('id')} />;
		}
	}
];
