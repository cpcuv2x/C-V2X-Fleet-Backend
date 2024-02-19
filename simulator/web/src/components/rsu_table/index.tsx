import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { getRSU } from "@/services/rsu";

export default function RSU_table() {
    const { data } = useQuery({
        queryKey: ['getRSU'],
        queryFn: async () => await getRSU()
    })

    return (
        <DataTable
            columns={columns}
            data={data ?? []}
        />
    )
}