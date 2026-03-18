interface ImpactRatingProps {
  rating: number;
  max?: number;
}

export default function ImpactRating({ rating, max = 5 }: ImpactRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < rating ? "bg-amadeus-accent" : "bg-gray-200"
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs text-gray-500">
        {rating}/{max}
      </span>
    </div>
  );
}
