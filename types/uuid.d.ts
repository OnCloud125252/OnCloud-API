// Type definitions For https://github.com/uuidjs/uuid

declare module "uuid" {
  /**
   * Generates a v6 UUID
   * @param options
   * @param buf
   * @param offset
   * @returns
   * @see https://github.com/uuidjs/uuid
   */
  export function v6(
    options?: object,
    buf?: Uint8Array | undefined,
    offset?: number | undefined,
  ): string | Uint8Array;
}
