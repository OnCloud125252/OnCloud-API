import { Tools } from "modules/openai/types/Tools";

export async function callFunction(
  functionName: string,
  args: object,
  tools: Tools,
) {
  return await tools[functionName].function(args);
}
