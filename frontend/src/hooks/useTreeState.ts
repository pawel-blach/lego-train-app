import { useState } from "react";

export function useTreeState(initialExpanded: string[]) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(initialExpanded));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return { expanded, toggle };
}
