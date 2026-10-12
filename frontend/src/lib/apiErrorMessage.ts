import axios from "axios";

export function apiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "An unexpected error occurred.";
  }

  const response = error.response?.data as
    | { message?: unknown; errors?: Record<string, unknown> }
    | undefined;
  if (typeof response?.message === "string") return response.message;

  const firstValidationError = Object.values(response?.errors ?? {}).find(
    (messages) => Array.isArray(messages) && typeof messages[0] === "string",
  );
  if (Array.isArray(firstValidationError)) return firstValidationError[0] as string;

  return error.message;
}
