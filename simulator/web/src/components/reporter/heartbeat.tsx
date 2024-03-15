import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Status } from "@/constant"
import { updateReporter } from "@/services/report"

interface HeartbeatProps {
    heartbeat: Exclude<Status, Status.WARNING>
}

export default function Heartbeat(props: HeartbeatProps) {
    const { heartbeat } = props
    return (
        <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-bold">Status</h2>
                <Select onValueChange={(value) => updateReporter({ heartbeat: value })}>
                    <SelectTrigger defaultValue={heartbeat} className="w-[150px]">
                        <SelectValue placeholder={heartbeat} />
                    </SelectTrigger>
                    <SelectContent defaultValue={heartbeat} >
                        <SelectItem value={Status.INACTIVE}>{Status.INACTIVE}</SelectItem>
                        <SelectItem value={Status.ACTIVE}>{Status.ACTIVE}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}