"use client";

import * as React from "react";
import { keyframes, type SxProps, type Theme } from "@mui/material";
import { ANIMATION, UI } from "@app/shared/config/config";

const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(${UI.PAGE_TRANSITION_OFFSET}px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

interface StaggerListProps {
  children: React.ReactNode;
  staggerDelay?: number;
}

export function StaggerList({ children, staggerDelay = ANIMATION.STAGGER }: StaggerListProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        const animationSx: SxProps<Theme> = {
          animation: `${fadeSlideIn} ${ANIMATION.NORMAL}ms ease-out ${index * staggerDelay}ms both`,
        };

        const existingSx = (child.props as { sx?: SxProps<Theme> }).sx;
        const mergedSx: SxProps<Theme> = existingSx
          ? [animationSx, ...(Array.isArray(existingSx) ? existingSx : [existingSx])]
          : animationSx;

        return React.cloneElement(child, { sx: mergedSx } as Record<string, unknown>);
      })}
    </>
  );
}
