import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

function StarRating({ value, onChange, readOnly = false, size = 24 }: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((starNumber) => {
        const isFilled = starNumber <= (hoveredStar ?? value);

        if (readOnly) {
          return (
            <Star
              key={starNumber}
              size={size}
              className={isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
            />
          );
        }

        return (
          <button
            key={starNumber}
            type="button"
            onClick={() => onChange?.(starNumber)}
            onMouseEnter={() => setHoveredStar(starNumber)}
            onMouseLeave={() => setHoveredStar(null)}
            className="cursor-pointer"
          >
            <Star
              size={size}
              className={
                isFilled
                  ? "fill-yellow-400 text-yellow-400 transition-colors"
                  : "text-muted-foreground transition-colors"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;