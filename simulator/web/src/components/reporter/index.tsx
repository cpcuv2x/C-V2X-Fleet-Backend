import { useQuery } from "@tanstack/react-query"
import { DataTable } from "@/components/ui/data-table";

import { columns } from "./columns";
import { getReporter } from "@/services/report";

export default function Reporter() {
    const { data } = useQuery({
        queryKey: ['getReporter'],
        queryFn: async () => await getReporter()
    })

    return (
        <DataTable
            columns={columns}
            data={data ?? []}
        />
    )
}