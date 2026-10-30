import React from "react";
import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-path";
import { draw } from "./theme";

/** The P mark. `outline` draws the hairline stroke on, `fill` fades the solid in. */
export const Logo: React.FC<{
  size: number;
  color: string;
  outline?: number;
  fill?: number;
  style?: React.CSSProperties;
}> = ({ size, color, outline = 1, fill = 1, style }) => (
  <svg width={size} height={size} viewBox={LOGO_VIEWBOX} style={{ overflow: "visible", ...style }}>
    <path
      d={LOGO_PATH}
      fillRule="evenodd"
      fill={color}
      fillOpacity={fill}
      stroke={color}
      strokeWidth={2}
      vectorEffect="non-scaling-stroke"
      strokeOpacity={1 - fill}
      {...draw(outline)}
    />
  </svg>
);
