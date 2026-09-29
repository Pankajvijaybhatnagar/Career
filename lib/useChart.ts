"use client";
import { useMemo } from "react";
import { computeChart } from "./astro/engine";
import { analyse } from "./astro/interpret";
import type { Student } from "./store";

/** Computes (memoised) the birth chart and analysis for a student. */
export function useChart(s: Student) {
  return useMemo(() => {
    const chart = computeChart(s.dateOfBirth, s.timeOfBirth, s.latitude, s.longitude, s.tzOffset);
    return { chart, analysis: analyse(chart) };
  }, [s.dateOfBirth, s.timeOfBirth, s.latitude, s.longitude, s.tzOffset]);
}
