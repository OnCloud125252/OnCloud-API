export function handleRecursiveError(error: any) {
  if ("__type__" in error && error.__type__ === "CLIENT_ERROR") {
    throw error;
  }
}
