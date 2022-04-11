import { useLayoutEffect, useState, useRef } from "react";
import { useWindowSize } from "../../hooks/useWindowSize";
import { Box } from "@material-ui/core";

export const ViewPanel = ({ children, bottomElementId, offset, ...rest }) => {
  const windowSize = useWindowSize();
  const [height, setHeight] = useState(0);
  const ref = useRef();

  useLayoutEffect(() => {
    if (windowSize.height) {
      try {
        const boundingRect = ref.current.getBoundingClientRect();
        const bottomElementRect = document.getElementById(bottomElementId).getBoundingClientRect();
        let height = Math.round(Math.abs(boundingRect.top - bottomElementRect.top));

        if (offset) {
          height -= offset;
        }

        setHeight(height);
      } catch (error) {
        setHeight("auto");
      }
    }
  }, [windowSize, bottomElementId, offset]);

  return (
    <Box ref={ref} style={{ height }} {...rest}>
      {children}
    </Box>
  );
};
