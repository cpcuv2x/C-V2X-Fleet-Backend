import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"

import { updateReporter } from "@/services/report";
import { Status } from "@/types/reporter";

export default function Reporter() {
    const { toast } = useToast()
    const sendReport = async (INCIDENT_TYPE: Status) => {
        const result = await updateReporter({ incident: INCIDENT_TYPE })
        if (result === 201) {
            toast({
                title: `${INCIDENT_TYPE} report is sent`,
                variant: "default",
            })
        }
        if (result === 400) {
            toast({
                title: "Please select a location first",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Button onClick={() => sendReport(Status.ACCIDENT)} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.ACCIDENT}</Button>
            <Button onClick={() => sendReport(Status.CLOSED_ROAD)} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.CLOSED_ROAD}</Button>
            <Button onClick={() => sendReport(Status.CONSTRUCTION)} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.CONSTRUCTION}</Button>
            <Button onClick={() => sendReport(Status.TRAFFIC_CONGESTION)} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.TRAFFIC_CONGESTION}</Button>
        </div>
    )
}