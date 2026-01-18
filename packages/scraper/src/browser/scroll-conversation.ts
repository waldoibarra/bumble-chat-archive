export async function scrollConversation(
  scrollSelector: string,
): Promise<void> {
  const container = document.querySelector(
    scrollSelector,
  ) as HTMLElement | null;

  if (!container) {
    throw new Error("Scroll container not found");
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let lastHeight = 0;
  let stableCount = 0;
  const STABLE_THRESHOLD = 3; // consecutive stable passes
  const HEIGHT_EPSILON = 5; // px tolerance

  // Start from bottom so upward scroll triggers loading
  container.scrollTop = container.scrollHeight;
  await sleep(600);

  while (stableCount < STABLE_THRESHOLD) {
    container.scrollTop = 0;
    await sleep(1000);

    const currentHeight = container.scrollHeight;
    const delta = Math.abs(currentHeight - lastHeight);

    if (delta < HEIGHT_EPSILON) {
      stableCount++;
    } else {
      stableCount = 0;
      lastHeight = currentHeight;
    }

    // Move away from top before next iteration
    container.scrollTop = container.scrollHeight;
    await sleep(500);
  }
}
