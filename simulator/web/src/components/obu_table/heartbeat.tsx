import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { updateOBU } from "@/services/obu"
import { CameraPostion, Status } from "@/constant"

interface HeartbeatProps {
    id: string
    heartbeat: Status
}

export default function Heartbeat(props: HeartbeatProps) {
    const { id, heartbeat } = props
    return (
        <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-bold">Status</h2>
                <Select onValueChange={(value) => updateOBU(id, { heartbeat: value })}>
                    <SelectTrigger defaultValue={heartbeat} className="w-[150px]">
                        <SelectValue placeholder={heartbeat} />
                    </SelectTrigger>
                    <SelectContent defaultValue={heartbeat} >
                        <SelectItem value={Status.INACTIVE}>{Status.INACTIVE}</SelectItem>
                        <SelectItem value={Status.ACTIVE}>{Status.ACTIVE}</SelectItem>
                        <SelectItem value={Status.WARNING}>{Status.WARNING}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* <div className="flex flex-col gap-3">
                <h2 className="font-bold">Camera</h2>
                <div className="flex flex-wrap gap-4">
                    <CameraSwitch id={id} defaultValue={heartbeat.front_camera} position={CameraPostion.FRONT} />
                    <CameraSwitch id={id} defaultValue={heartbeat.back_camera} position={CameraPostion.BACK} />
                    <CameraSwitch id={id} defaultValue={heartbeat.left_camera} position={CameraPostion.LEFT} />
                    <CameraSwitch id={id} defaultValue={heartbeat.right_camera} position={CameraPostion.RIGHT} />
                </div>
            </div> */}
        </div>
    )
}

interface CameraSwitchProps {
    id: string
    position: CameraPostion
    defaultValue: Status.ACTIVE | Status.INACTIVE
}

export function CameraSwitch(props: CameraSwitchProps) {
    const { id, position, defaultValue } = props

    return (
        <div className="flex items-center gap-2">
            <Switch
                defaultChecked={defaultValue === Status.ACTIVE ? true : false}
                onCheckedChange={check => updateOBU(id, { 'camera': { [position]: check ? 'ACTIVE' : 'INACTIVE' } })}
            />
            {position}
            <Separator orientation="vertical" />
        </div>
    )
}