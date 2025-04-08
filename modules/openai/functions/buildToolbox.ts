import { ToolBox } from "modules/openai/types/ToolBox";
import { Tools } from "modules/openai/types/Tools";

export function buildToolbox(tools: Tools): ToolBox {
  return {
    tools,
    toolsDefinitions: Object.values(tools).map((tool) => ({
      type: "function",
      function: tool.definition,
    })),
  };
}
