import { FunctionDefinition } from "openai/resources";

type FunctionResponse =
  | {
      functionName: string;
      message: string;
      data?: object | string | number | boolean;
      skipOpenAiSummary: boolean;
    }
  | {
      functionName: string;
      message: string;
      skipOpenAiSummary: false;
      errorProcessMethod: "stop and quit" | "retry with different input";
    };

export type Tool = {
  function: (args: any) => Promise<FunctionResponse>;
  definition: FunctionDefinition;
};
