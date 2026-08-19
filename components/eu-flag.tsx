import { mergeClassNames } from "@/lib/utils";

/** Outer radius of each star, in viewBox units. */
const STAR_R = 4;

/** A five-pointed star centred on the origin, point upwards. */
const starPoints = Array.from({ length: 10 }, (_, index) => {
  const radius = index % 2 === 0 ? STAR_R : STAR_R * 0.382;
  const angle = ((-90 + index * 36) * Math.PI) / 180;
  return `${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`;
}).join(" ");

/** Twelve stars in a circle of radius 1/3 the flag height, per the EU spec. */
const stars = Array.from({ length: 12 }, (_, index) => {
  const angle = (index * 30 * Math.PI) / 180;
  return {
    x: 45 + 20 * Math.sin(angle),
    y: 30 - 20 * Math.cos(angle),
  };
});

/**
 * Emblem of the European Union, drawn to spec: 2:3 field of Reflex Blue with a
 * circle of twelve Yellow stars. Required for EDF-funded visibility, so it is
 * worth rendering properly rather than approximating.
 */
const EuFlag = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 90 60"
    className={mergeClassNames("shrink-0", className)}
    role="img"
    aria-label="Flag of the European Union"
  >
    <rect width="90" height="60" fill="#003399" />
    {stars.map((star) => (
      <polygon
        key={`${star.x}-${star.y}`}
        points={starPoints}
        fill="#FFCC00"
        transform={`translate(${star.x.toFixed(2)} ${star.y.toFixed(2)})`}
      />
    ))}
  </svg>
);

export default EuFlag;
