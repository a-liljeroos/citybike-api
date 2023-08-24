export function cleanData(obj: { [key: string]: string | number }): {
  [key: string]: string | number;
} {
  const result: { [key: string]: string | number } = {};

  // it removes the trailing and leading spaces from the values of the object
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      result[key] = value.trim();
    } else {
      result[key] = value;
    }
  }

  return result;
}
