import { Button } from "@/components/ui/button";
import { Status } from "@/types/reporter";

export default function Reporter() {
    return (
        <div className="flex flex-col gap-4">
            <Button className="hover:bg-red-300 hover:text-white" variant={"secondary"}>{Status.ACCIDENT}</Button>
            <Button className="hover:bg-red-300 hover:text-white" variant={"secondary"}>{Status.CLOSED_ROAD}</Button>
            <Button className="hover:bg-red-300 hover:text-white" variant={"secondary"}>{Status.CONSTRUCTION}</Button>
            <Button className="hover:bg-red-300 hover:text-white" variant={"secondary"}>{Status.TRAFFIC_CONGESTION}</Button>
        </div>
    )
}