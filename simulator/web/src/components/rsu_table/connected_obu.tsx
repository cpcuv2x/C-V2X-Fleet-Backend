import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function Connected_OBU() {
    return (
        <div>
            <Button variant={"default"} className="mx-2 font-bold">OBU 1</Button>
            <Popover>
                <PopoverTrigger>
                    <Button variant={"outline"}>+</Button>
                </PopoverTrigger>
                <PopoverContent>
                    <Button variant={"secondary"}>OBU 2</Button>
                </PopoverContent>
            </Popover>
        </div>
    )
}