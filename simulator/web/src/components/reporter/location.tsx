import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateReporter } from '@/services/report';

interface LocationProps {
    route: string;
}

export default function Location(props: LocationProps) {
    const { route } = props;
    return (
        <div className="min-w-fit w-[180px] flex flex-col gap-2">
            <h2 className="font-bold">Simulation route</h2>
            <Select
                onValueChange={(value) => updateReporter({ location: value })}
                defaultValue={route}
            >
                <SelectTrigger className="w-[130px] min-w-fit">
                    <SelectValue placeholder="Select Route" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="chula">จุฬา</SelectItem>
                    <SelectItem value="exat">การทางพิเศษ</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
