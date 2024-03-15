import { ColumnDef } from '@tanstack/react-table';

import Heartbeat from './heartbeat';
import { Reporter } from '@/types/reporter';
import Location from './location';
import ReportCol from './report';

export const columns: ColumnDef<Reporter>[] = [
    {
        accessorKey: 'heartbeat',
        header: 'Heartbeat',
        cell: ({ row }) => {
            const heartbeat = row.getValue<any>('heartbeat');
            return <Heartbeat heartbeat={heartbeat} />;
        },
    },
    {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => {
            const route = row.getValue<string>('location');
            return <Location route={route} />;
        },
    },
    {
        header: 'Sending Report',
        cell: () => {
            return <ReportCol />;
        }
    }
];
