export const measureExecutionTime = (startTime: number) => {
  const endTime = Date.now();
  return `${endTime - startTime} ms`;
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
