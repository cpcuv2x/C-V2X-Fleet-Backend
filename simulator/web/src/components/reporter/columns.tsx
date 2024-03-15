import { ColumnDef } from '@tanstack/react-table';

import Heartbeat from './heartbeat';
import { Reporter as TReporter } from '@/types/reporter';
import Location from './location';
import Reporter from './report';

export const columns: ColumnDef<TReporter>[] = [
    {
        accessorKey: 'heartbeat',
        header: 'Heartbeat',
        cell: ({ row }) => {
            const id = row.getValue<string>('id');
            const heartbeat = row.getValue<any>('heartbeat');
            return <Heartbeat id={id} heartbeat={heartbeat} />;
        },
    },
    {
        accessorKey: 'route',
        header: 'Location',
        cell: ({ row }) => {
            const id = row.getValue<string>('id');
            const route = row.getValue<string>('route');
            return <Location id={id} route={route} />;
        },
    },
    {
        accessorKey: 'report',
        header: 'Sending Report',
        cell: () => {
            return <Reporter />;
        }
    }
];
