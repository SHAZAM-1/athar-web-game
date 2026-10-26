export function getDiscoveryMessage(index: number): string {
  return index === 1
    ? 'A warm light answers. The hidden trace is awake.'
    : 'You found the trace. The world remembers your touch.';
}
