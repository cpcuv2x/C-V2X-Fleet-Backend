import { ColumnDef } from '@tanstack/react-table';

import { Reporter } from '@/types/reporter';
import Location from './location';
import ReportCol from './report';

export const columns: ColumnDef<Reporter>[] = [
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
