import xior from "xior";

async function deliverMessage() {
  try {
    const response = await xior.request({
      method: "post",
      url: "http://localhost:8099/webhook",
      data: {
        event: "user.created",
        data: {
          foo: "bar",
        },
      },
      headers: {
        "x-webhook-secret": "aabb",
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);

    throw new Error("Failed to deliver message", {
      cause: {
        error,
      },
    });
  }
}

try {
  await deliverMessage();
} catch (error) {
  console.log(error);
}
