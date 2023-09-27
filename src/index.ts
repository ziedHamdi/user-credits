function add(...numbers: number[]): number {
  if (!numbers.length) {
    throw new Error("At least one number argument must be provided!");
  }

  return numbers.reduce((sum, number) => sum + number, 0);
}

export { add };
