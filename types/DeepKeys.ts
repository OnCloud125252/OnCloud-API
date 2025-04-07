export type DeepKeys<T> = T extends object
  ? T extends Array<infer U>
    ? DeepKeys<U>
    : {
        [K in keyof T]: K extends string
          ? T[K] extends object | Array<any>
            ? K | `${K}.${DeepKeys<T[K]>}` | DeepKeys<T[K]>
            : K
          : never;
      }[keyof T]
  : never;
