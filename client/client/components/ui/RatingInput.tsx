import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingInputProps {
    value?: number; // 0 - 5
    onChange?: (value: number) => void;
    name?: string;
    size?: number; // px size for the icons
}

export const RatingInput: React.FC<RatingInputProps> = ({
    value = 0,
    onChange,
    name,
    size = 18,
}) => {
    const [rating, setRating] = React.useState<number>(value);

    React.useEffect(() => setRating(value), [value]);

    const handleClick = (v: number) => {
        setRating(v);
        onChange?.(v);
    };

    return (
        <div className="flex items-center gap-2" aria-hidden>
            <input type="hidden" name={name} value={rating} />
            {Array.from({ length: 5 }).map((_, i) => {
                const v = i + 1;
                const isActive = v <= rating;
                return (
                    <button
                        key={v}
                        type="button"
                        onClick={() => handleClick(v)}
                        aria-label={`Rate ${v}`}
                        className={cn(
                            "p-1 rounded-md transition-colors focus:outline-none",
                            isActive ? "text-yellow-500" : "text-muted-foreground/70 hover:text-yellow-500",
                        )}
                    >
                        <Star className="inline-block" width={size} height={size} />
                    </button>
                );
            })}
        </div>
    );
};

export default RatingInput;
