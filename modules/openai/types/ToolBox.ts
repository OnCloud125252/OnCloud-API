import { ChatCompletionTool } from "openai/resources";

import { Tools } from "./Tools";

export type ToolBox = { toolsDefinitions: ChatCompletionTool[]; tools: Tools };
