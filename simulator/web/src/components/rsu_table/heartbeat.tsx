import { Switch } from "@/components/ui/switch"
import { Status } from "@/constant"
import { updateRSU } from "@/services/rsu"

interface HeartbeatProps {
    id: string
    status: Status
}

export default function Heartbeat(props: HeartbeatProps) {
    const { id, status } = props

    return (
        <div className="flex items-center gap-2">
            <div>Inactive</div>
            <Switch
                defaultChecked={status === Status.ACTIVE ? true : false}
                onCheckedChange={check => updateRSU(id, { 'status': check ? 'ACTIVE' : 'INACTIVE' })}
            />
            <div>Active</div>
        </div>
    )
}