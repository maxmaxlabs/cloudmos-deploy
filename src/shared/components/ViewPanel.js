import { useLayoutEffect, useState, useRef } from "react";
import { useWindowSize } from "../../hooks/useWindowSize";
import { Box } from "@material-ui/core";

export const ViewPanel = ({ children, bottomElementId, ...rest }) => {
  const windowSize = useWindowSize();
  const [height, setHeight] = useState(0);
  const ref = useRef();

  useLayoutEffect(() => {
    if (windowSize.height) {
      try {
        const boundingRect = ref.current.getBoundingClientRect();
        const bottomElementRect = document.getElementById(bottomElementId).getBoundingClientRect();
        const height = Math.abs(boundingRect.top - bottomElementRect.top);

        setHeight(height);
      } catch (error) {
        setHeight("auto");
      }
    }
  }, [windowSize, bottomElementId]);

  return (
    <Box ref={ref} style={{ height }} {...rest}>
      {children}
    </Box>
  );
};
