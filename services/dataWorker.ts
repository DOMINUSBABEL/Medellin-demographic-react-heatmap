/// <reference lib="webworker" />

import { generateMedellinData, processKDTree } from './dataService';

self.onmessage = (event: MessageEvent) => {
  if (event.data.type === 'START') {
    // 1. Generate Raw Points (Simulated Individuals)
    // Target: ~2500 people per cell.
    // Calculation: Depth 10 = 1024 cells.
    // 1024 cells * 2550 avg pop = ~2,611,200 Total Simulated Population.
    // Using 26,000 points with weight ~100 gives exactly this scale.
    const rawPoints = generateMedellinData(26000);

    // 2. Process into K-D Tree Grid (High Resolution)
    // Depth 10 provides 1024 distinct micro-zones.
    const adaptiveGridData = processKDTree(rawPoints, 10);

    self.postMessage({ type: 'DATA_READY', data: adaptiveGridData });
  }
};
