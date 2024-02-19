import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { updateRSU } from '@/services/rsu';

interface LocationProps {
	id: string;
	location: string;
}

export default function Location(props: LocationProps) {
	const { id, location } = props;
	return (
		<div className="min-w-fit w-[180px] flex flex-col gap-2">
			<h2 className="font-bold">Simulation Position</h2>
			<Select onValueChange={(value) => updateRSU(id, { location: value })} defaultValue={location}>
				<SelectTrigger className="w-[130px] min-w-fit">
					<SelectValue placeholder="Select Position" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="chula">จุฬา</SelectItem>
					<SelectItem value="exat">การทางพิเศษ</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
