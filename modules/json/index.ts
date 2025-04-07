import { parse } from "./functions/parse";
import { stringify } from "./functions/stringify";

export const json = {
  stringify,
  parse,
  toJson: (
    obj: any,
    options: {
      preserve: { undefined?: boolean; NaN?: boolean };
    } = {
      preserve: {
        undefined: false,
        NaN: false,
      },
    },
  ) => {
    const preserveUndefined = options.preserve.undefined;
    const preserveNaN = options.preserve.NaN;

    return json.parse(
      stringify(obj, {
        preserve: {
          undefined: preserveUndefined,
          NaN: preserveNaN,
        },
        useOriginal: {
          undefined: true,
          NaN: true,
        },
      }),
    );
  },
};
