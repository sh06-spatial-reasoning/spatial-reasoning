import { useShallow } from "zustand/react/shallow";
import {
  cubeLocationFromCuboidValues,
  useDrawingStore,
} from "@/drawing/DrawingStoreHook.ts";
import { coordinatesMap, rotate, isValidColumn } from "@/util.ts";

/**
 * Represents a coded plan of a structure, this also rotates with the structure.
 *
 * Screenshot:
 *
 * ![screenshot](screenshots/CodedPlan.png)
 */
export function CodedPlan() {
  const [shouldShowCodedPlanNumbers, cuboidValues, rotation] = useDrawingStore(
    useShallow((state) => [
      state.shouldShowCodedPlanNumbers,
      state.cuboidValues,
      state.rotation,
    ]),
  );

  let coordinates = cubeLocationFromCuboidValues(cuboidValues).map(
    ({ cuboidIndex, ...rest }) => rest,
  );
  coordinates = rotate(coordinates, rotation);

  // coded plan is a view from the top, flatten y-axis to operate on columns
  const [map, limits] = coordinatesMap("y", coordinates);

  const squares = [];
  for (const [XCoordinate, ZYPlane] of Object.entries(map)) {
    for (const [ZCoordinate, YCoordinatesSet] of Object.entries(ZYPlane)) {
      const YCoordinatesArray = [...YCoordinatesSet.values()];

      // for a coded plan to exists, it must have a flat base on the X-Z plane and have no overhangs.
      if (!isValidColumn(YCoordinatesArray)) {
        return null;
      }

      // coordinate starts at 0 and height starts at 1
      const height = YCoordinatesArray[YCoordinatesArray.length - 1] + 1;
      const centerX = (limits.x.min + limits.x.max) / 2;
      const centerY = (limits.z.min + limits.z.max) / 2;

      squares.push(
        <rect
          x={parseInt(XCoordinate)}
          y={parseInt(ZCoordinate)}
          width={1}
          height={1}
          fillOpacity={0}
          stroke="black"
          strokeWidth={0.1}
          transform={`translate(${centerX} ${centerY}) scale(1 0.57735) translate(${-centerX} ${-centerY}) rotate(45 ${centerX} ${centerY})`}
        />,
      );
      const x = parseInt(XCoordinate) + 0.5 - centerX;
      const y = parseInt(ZCoordinate) + 0.6 - centerY;
      const rotatedX =
        centerX + x * Math.cos(Math.PI / 4) - y * Math.sin(Math.PI / 4);
      const rotatedY =
        centerY + x * Math.sin(Math.PI / 4) + y * Math.cos(Math.PI / 4);
      if (shouldShowCodedPlanNumbers) {
        squares.push(
          <text
            x={rotatedX + 0.05}
            y={(rotatedY - centerY) * 0.57735 + centerY + 0.1}
            fill="black"
            textAnchor="middle"
            style={{ fontSize: "0.5px", fontFamily: "monospace" }}
          >
            {height}
          </text>,
        );
      }
    }
  }

  // add one for height from coordinates, add two for margins
  const pixelWidth = limits.x.max - limits.x.min + 1 + 2;
  const pixelHeight = limits.z.max - limits.z.min + 1 + 2;
  const centerX = (limits.x.min + limits.x.max) / 2;
  const centerY = (limits.z.min + limits.z.max) / 2;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${limits.x.min - 1} ${limits.z.min - 1} ${pixelWidth} ${pixelHeight}`}
      data-export-name="codedplan"
    >
      <g transform={`rotate(0, ${centerX}, ${centerY})`}>{squares}</g>
    </svg>
  );
}
