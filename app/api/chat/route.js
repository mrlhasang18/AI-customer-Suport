import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt =
  "Security Pal is a comprehensive cybersecurity solution designed to protect individuals and organizations from digital threats. It offers advanced features such as real-time threat detection, secure communication channels, and vulnerability assessments. Describe how Security Pal enhances digital security and what specific tools or strategies it uses to safeguard users from cyber attacks. Discuss its role in maintaining data integrity and privacy in today's increasingly complex digital landscape.";

// exporting for post 
/*
export async function POST(req){
    const openai = new OpenAI()
    //gets json data from your requests
    const data = await req.json()
    

    //from your requests
    const completion = await openai.chat.completions.create(
        {
          messages:[
            {
              role: 'system',
              content: systemPrompt,
            },
            ...data,
          ],
          model: 'gpt-4o-mini',
          stream: true,
        }
    )
    
    //stream response by creating new readable stream
    const stream = new ReadableStream({
        async start(controller){
        const encoder = new TextEncoder()
        try {
          for await (const chunk of completion){
                const content = chunk.choices[0].delta.content
                if(content){
                    const text = encoder.encode(content)
                    controller.enqueue(text)
                }
            } 
        }catch (err) {
            controller.error(err)
         } finally {
            controller.close()
         }
        },
    })

    return new NextResponse(stream)
}
*/

// Let's use Gemini instead of OpenAI
export async function POST(req) {
  try {
    console.log("API route called");

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("GoogleGenerativeAI initialized");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    console.log("Model retrieved");

    const data = await req.json();
    console.log("Request data:", JSON.stringify(data));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I'll act as an AI assistant for Security Pal, providing information about its features and benefits." }],
        },
        ...data.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ],
    });
    console.log("Chat started");

    const result = await chat.sendMessageStream(data[data.length - 1].content);
    console.log("Message stream sent");

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = encoder.encode(chunk.text());
            controller.enqueue(text);
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    console.log("Stream created successfully");
    return new NextResponse(stream);
  } catch (error) {
    console.error("API route error:", error);
    return new NextResponse(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}