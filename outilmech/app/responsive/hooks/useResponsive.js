// hooks/useResponsive.js
import { useMediaQuery } from "react-responsive";
import { breakpoints } from "../responsive";

export function useResponsive() {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile });
  const isTablet = useMediaQuery({
    minWidth: breakpoints.mobile + 1,
    maxWidth: breakpoints.tablet,
  });
  const isDesktop = useMediaQuery({ minWidth: breakpoints.tablet + 1 });

  return { isMobile, isTablet, isDesktop };
}
