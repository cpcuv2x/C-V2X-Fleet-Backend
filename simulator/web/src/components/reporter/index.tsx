import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table";

import { columns } from "./columns";

export default function Reporter() {
    // const { data } = useQuery({
    //     queryKey: ['getRSU'],
    //     queryFn: async () => await getRSU()
    // })

    return (
        <DataTable
            columns={columns}
            data={[{
                heartbeat: 'Heartbeat',
                location: 'Location',
            }]}
        />
    )
}