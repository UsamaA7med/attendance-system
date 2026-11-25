import axios from "axios";

interface FriendlyErrorOptions {
  fallback: string;
  conflict?: string;
  unauthorized?: string;
}

export function getFriendlyErrorDescription(
  error: unknown,
  options: FriendlyErrorOptions
): string {
  if (!axios.isAxiosError(error)) {
    return options.fallback;
  }

  if (!error.response) {
    return "Check your internet connection and try again.";
  }

  switch (error.response.status) {
    case 400:
      return "Some information is missing or invalid. Review your entries and try again.";
    case 401:
      return options.unauthorized ?? "Your session may have expired. Please sign in again.";
    case 403:
      return "You don't have permission to complete this action.";
    case 404:
      return "This item is no longer available. Refresh the page and try again.";
    case 409:
      return options.conflict ?? "This conflicts with an existing record. Review the details and try again.";
    default:
      return error.response.status >= 500
        ? "Something went wrong. Please try again shortly."
        : options.fallback;
  }
}
