"use client";

import { useEffect, useRef } from "react";
import { trackCalculatorRun } from "./analytics";

const DEBOUNCE_MS = 2500;

export function useCalculatorAnalytics(options: {
  section: string;
  tabKey: string;
  calculator: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}) {
  const { section, tabKey, calculator, inputs, outputs } = options;
  const readyRef = useRef(false);
  const lastSentRef = useRef<string>("");
  const inputsKey = JSON.stringify(inputs);
  const outputsKey = JSON.stringify(outputs ?? {});

  useEffect(() => {
    // Skip the initial default values mount.
    if (!readyRef.current) {
      readyRef.current = true;
      return;
    }

    const payload = JSON.stringify({
      inputs: JSON.parse(inputsKey) as Record<string, unknown>,
      outputs: JSON.parse(outputsKey) as Record<string, unknown>,
    });
    if (payload === lastSentRef.current) return;

    const timer = window.setTimeout(() => {
      lastSentRef.current = payload;
      const parsed = JSON.parse(payload) as {
        inputs: Record<string, unknown>;
        outputs: Record<string, unknown>;
      };
      trackCalculatorRun({
        section,
        tabKey,
        calculator,
        inputs: parsed.inputs,
        outputs: parsed.outputs,
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [section, tabKey, calculator, inputsKey, outputsKey]);
}
