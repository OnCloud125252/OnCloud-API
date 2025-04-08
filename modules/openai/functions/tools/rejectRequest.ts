function rejectRequest_function() {
  return {
    message:
      "Reject user's request using their language. Example: 'This request is beyond my capabilities, and I apologize for not being able to assist you with it.'",
  };
}

const rejectRequest_definition = {
  name: "rejectRequest",
  description:
    "Reject user's request if user is not requesting services related to flights or itinerary, or if user's request didn't suit any of the available tools.",
};

export const rejectRequest = {
  function: rejectRequest_function,
  definition: rejectRequest_definition,
};
