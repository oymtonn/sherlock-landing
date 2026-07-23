/* Safe error contract shared by the browser transport and UI. */
export class ApiClientError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}
