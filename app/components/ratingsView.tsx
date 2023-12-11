import { StarIcon } from "@heroicons/react/24/solid";
import { times } from "lodash-es";

const MAX_RATING = 5;

export default function RatingView(p: { value: number }) {
  return (
    <div className="flex items-center">
      {times(Math.floor(p.value)).map((d) => (
        <StarIcon key={d} className="h-6 text-yellow-500" />
      ))}
    </div>
  );
}
