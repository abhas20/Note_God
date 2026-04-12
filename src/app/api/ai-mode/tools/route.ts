import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  generateImage,
} from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

export async function POST(req: Request) {
  const {
    messages,
    enabledTools,
  }: { messages: UIMessage[]; enabledTools: string[] } = await req.json()

  try {
    const activeTools: Record<string, any> = {}

    if (enabledTools.includes('googleSearch')) {
      activeTools.googleSearch = googleAI.tools.googleSearch({
        searchTypes: { webSearch: {} },
      })
    }

    if (enabledTools.includes('executeCode')) {
      // TODO: Piston/Judge0 implementation to run code securely
      activeTools.executeCode = googleAI.tools.codeExecution({})
    }

    if (enabledTools.includes('search_url')) {
      activeTools.search_url = googleAI.tools.urlContext({})
    }

    if (enabledTools.includes('generate_image')) {
      activeTools.generate_image = tool({
        description: 'Generate an image based on a text prompt.',
        inputSchema: z.object({
          prompt: z
            .string()
            .describe('The text prompt to generate an image from'),
        }),
        execute: async ({ prompt }) => {
          try {
            const { image } = await generateImage({
              model: googleAI.image('gemini-2.5-flash-image'),
              prompt,
              aspectRatio: '16:9',
              maxRetries: 0,
            })
            // console.log(image)

            return { imageUrl: `data:image/jpeg;base64,${image.base64}` }
          } catch (error) {
            console.error('generate_image tool failed:', error)
            throw error
          }
        },
      })
    }

    const result = await streamText({
      model: googleAI('gemini-2.5-flash'),
      temperature: 0.7,
      system: `You are the Note God AI Tutor. You have access to powerful tools.
      CRITICAL INSTRUCTIONS:
      1. If the user asks for an image, diagram, or picture, YOU MUST USE THE 'generate_image' TOOL. Do NOT say you cannot generate images instead ask user to activate. 
      2. If the user asks for current events or facts, YOU MUST USE THE 'googleSearch' TOOL.
      3. If the user provides a URL, use the 'search_url' tool to read it.
      4. Always rely on your tools when asked to perform a task outside of standard text generation.`,
      messages: await convertToModelMessages(messages),
      tools: Object.keys(activeTools).length > 0 ? activeTools : undefined,
      onStepFinish: (event) => {
        if (event.toolCalls?.length) {
          console.log(`🛠️  Executing ${event.toolCalls.length} tool(s)...`)
        }
      },
      maxRetries: 0,
    })

    // console.log(activeTools);
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Error in AI response generation:', error)
    return new Response('Error generating AI response', { status: 500 })
  }
}
