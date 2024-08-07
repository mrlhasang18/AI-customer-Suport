import { NextResponse } from "next/server";
//import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt =
"Security Pal is a comprehensive cybersecurity solution designed to protect individuals and organizations from digital threats. It offers advanced features such as real-time threat detection, secure communication channels, and vulnerability assessments. Describe how Security Pal enhances digital security and what specific tools or strategies it uses to safeguard users from cyber attacks. Discuss its role in maintaining data integrity and privacy in today's increasingly complex digital landscape."



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


//let's use gemini instead of openAI
export async function POST(req) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  
    const data = await req.json();
  
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
  
    const result = await chat.sendMessageStream(data[data.length - 1].content);
  
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = encoder.encode(chunk.text());
            controller.enqueue(text);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });
  
    return new NextResponse(stream);
  }