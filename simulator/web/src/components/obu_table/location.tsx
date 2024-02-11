import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function Location() {
    return (
        <div className="min-w-fit w-[180px] flex flex-col gap-2">
            <h2 className="font-bold">Simulation route</h2>
            <Select>
                <SelectTrigger className="w-[130px] min-w-fit">
                    <SelectValue placeholder='Chula route' />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Chula route">Chula route</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}