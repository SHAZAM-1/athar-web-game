export type DiscoveryResult = {
  progress: number;
  solved: boolean;
  message: string;
};

const SOLUTION = [0, 2, 1] as const;

export function advanceDiscovery(progress: number, tappedIndex: number): DiscoveryResult {
  if (progress >= SOLUTION.length) {
    return {
      progress: SOLUTION.length,
      solved: true,
      message: 'The trace is awake. The world remembers your touch.',
    };
  }

  if (tappedIndex !== SOLUTION[progress]) {
    return {
      progress: 0,
      solved: false,
      message: 'The lights fall quiet. Look again, and try another path.',
    };
  }

  const nextProgress = progress + 1;
  if (nextProgress === SOLUTION.length) {
    return {
      progress: nextProgress,
      solved: true,
      message: 'You found the trace. The world remembers your touch.',
    };
  }

  return {
    progress: nextProgress,
    solved: false,
    message: nextProgress === 1
      ? 'The first light answers. Follow the violet trace next.'
      : 'A second light answers. One last light remains.',
  };
}
