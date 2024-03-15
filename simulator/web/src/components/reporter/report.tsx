import { Button } from "@/components/ui/button";
import { updateReporter } from "@/services/report";
import { Status } from "@/types/reporter";

export default function Reporter() {
    return (
        <div className="flex flex-col gap-4">
            <Button onClick={() => updateReporter({ incident: Status.ACCIDENT })} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.ACCIDENT}</Button>
            <Button onClick={() => updateReporter({ incident: Status.CLOSED_ROAD })} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.CLOSED_ROAD}</Button>
            <Button onClick={() => updateReporter({ incident: Status.CONSTRUCTION })} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.CONSTRUCTION}</Button>
            <Button onClick={() => updateReporter({ incident: Status.TRAFFIC_CONGESTION })} className="hover:bg-red-300 hover:text-white active:bg-yellow-300" variant={"secondary"}>{Status.TRAFFIC_CONGESTION}</Button>
        </div>
    )
}