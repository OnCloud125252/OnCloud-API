export type DeepKeysPath<T> = T extends object
  ? {
      [K in keyof T & (string | number)]:
        | K
        | (T[K] extends Array<infer U>
            ? `${K}[${number}]` | `${K}[${number}].${DeepKeysPath<U>}`
            : T[K] extends object
              ? `${K}.${DeepKeysPath<T[K]>}`
              : never);
    }[keyof T & (string | number)]
  : never;
