import { toast } from "sonner";

interface PromiseMessages<T> {
  loading?: string;
  success?: string | ((data: T) => string);
  error?: string | ((err: unknown) => string);
}

/**
 * Centralized notification utility.
 * Wraps sonner's toast with a consistent API.
 * Use `notify.success` / `notify.error` / `notify.info` / `notify.warning` for simple toasts.
 * Use `notify.promise` for async operations with loading/success/error states.
 */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),

  /**
   * Wraps a promise with loading/success/error toasts.
   * Returns the original promise so callers can chain `.unwrap()` etc.
   */
  promise: <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T> = {}
  ): Promise<T> => {
    toast.promise(promise, {
      loading: messages.loading || "Loading...",
      success: (data: T) =>
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success || "Success!",
      error: (err: unknown) =>
        typeof messages.error === "function"
          ? messages.error(err)
          : messages.error ||
            (err as { data?: { error?: { message?: string } } })?.data?.error
              ?.message ||
            "Something went wrong",
    });
    return promise;
  },
};
