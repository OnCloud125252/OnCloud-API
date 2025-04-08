import axios from "axios";

import { environmentVariable } from "modules/environmentVariable";
import { Tool } from "modules/openai/types/Tool";

export const get_place_title_by_address: Tool = {
  function: async ({
    multipleSearchQuery,
  }: { multipleSearchQuery: string[] }) => {
    const processAddress = async (address: string) => {
      try {
        const response = await axios.post(
          "https://places.googleapis.com/v1/places:searchText",
          {
            textQuery: address,
            languageCode: "zh-TW",
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": environmentVariable.google.maps.all.apiKey(),
              "X-Goog-FieldMask": "places.displayName",
            },
          },
        );

        if (response.data.places && response.data.places.length > 0) {
          const title = response.data.places[0].displayName.text;

          return {
            address,
            title,
          };
        } else {
          return {
            address,
            title: address,
          };
        }
      } catch (_error) {
        return {
          address,
          title: address,
        };
      }
    };

    const results = await Promise.all(
      multipleSearchQuery.map((address) => processAddress(address)),
    );

    return {
      functionName: "get_place_title_by_address",
      message: "found place titles by addresses",
      data: results,
      skipOpenAiSummary: false,
    };
  },
  definition: {
    name: "get_place_title_by_address",
    description: "用多個地址查詢多個地點名稱，請注意這個功能只能用於查詢地址。",
    strict: true,
    parameters: {
      type: "object",
      required: ["multipleSearchQuery"],
      properties: {
        multipleSearchQuery: {
          type: "array",
          items: {
            type: "string",
            description: "要查詢的地址（僅支持英文）",
          },
        },
      },
      additionalProperties: false,
    },
  },
};
