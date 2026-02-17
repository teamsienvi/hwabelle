import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function pollRunUntilComplete(threadId: string, runId: string, apiKey: string, maxWaitMs = 90000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: { Authorization: `Bearer ${apiKey}`, "OpenAI-Beta": "assistants=v2" },
    });
    const run = await res.json();
    if (run.status === "completed") return;
    if (["failed", "cancelled", "expired"].includes(run.status)) {
      throw new Error(`Run ${run.status}: ${run.last_error?.message || "unknown"}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Assistant run timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const ASSISTANT_ID = Deno.env.get("OPENAI_DESIGNER_ASSISTANT_ID");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
    if (!ASSISTANT_ID) throw new Error("OPENAI_DESIGNER_ASSISTANT_ID is not configured");

    const contentType = req.headers.get("content-type") || "";
    let userMessage = "";
    let imageBase64: string | null = null;
    let imageMediaType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      userMessage = (formData.get("message") as string) || "";
      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        imageMediaType = imageFile.type || "image/jpeg";
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        imageBase64 = btoa(binary);
      }
    } else {
      const body = await req.json();
      userMessage = body.message || "";
    }

    const headers = {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
    };

    // 1. Upload image to OpenAI if present
    let fileId: string | null = null;
    if (imageBase64) {
      // Convert base64 back to binary for upload
      const binaryStr = atob(imageBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const ext = imageMediaType.split("/")[1] || "jpg";
      const blob = new Blob([bytes], { type: imageMediaType });
      const form = new FormData();
      form.append("file", blob, `upload.${ext}`);
      form.append("purpose", "vision");

      const uploadRes = await fetch("https://api.openai.com/v1/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: form,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("File upload failed:", errText);
        // Fall back to message-only if image upload fails
      } else {
        const uploadData = await uploadRes.json();
        fileId = uploadData.id;
      }
    }

    // 2. Create thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    if (!threadRes.ok) throw new Error(`Failed to create thread: ${await threadRes.text()}`);
    const thread = await threadRes.json();

    // 3. Build message content
    type ContentPart =
      | { type: "text"; text: string }
      | { type: "image_file"; image_file: { file_id: string; detail: string } };

    const contentParts: ContentPart[] = [];

    if (fileId) {
      contentParts.push({
        type: "image_file",
        image_file: { file_id: fileId, detail: "high" },
      });
    }

    contentParts.push({
      type: "text",
      text: userMessage || "Please analyse this image and provide botanical identification and design suggestions.",
    });

    // 4. Add message to thread
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        role: "user",
        content: contentParts,
      }),
    });
    if (!msgRes.ok) throw new Error(`Failed to add message: ${await msgRes.text()}`);

    // 5. Run
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ assistant_id: ASSISTANT_ID }),
    });
    if (!runRes.ok) throw new Error(`Failed to create run: ${await runRes.text()}`);
    const run = await runRes.json();

    // 6. Poll until complete
    await pollRunUntilComplete(thread.id, run.id, OPENAI_API_KEY);

    // 7. Get latest assistant message
    const msgsRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages?order=desc&limit=1`,
      { headers }
    );
    if (!msgsRes.ok) throw new Error(`Failed to get messages: ${await msgsRes.text()}`);
    const msgs = await msgsRes.json();

    const reply = msgs.data?.[0]?.content
      ?.filter((c: { type: string }) => c.type === "text")
      ?.map((c: { type: string; text: { value: string } }) => c.text?.value)
      ?.join("\n") || "No response received.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-designer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
