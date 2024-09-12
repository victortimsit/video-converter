import { NextResponse } from "next/server";
import { openai } from "../../../services/openai";

export async function POST(request: Request) {
  const body = await request.json();
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You write ffmpeg command from plain text. I will send you what I want to do with my file and you will reply only with the ffmpeg command in JSON format as follows: { 'ffmpeg_command': 'your command here' }",
      },
      {
        role: "user",
        content: `Input name: ${body.input_filename}\nInstruction: ${body.instruction}`,
      },
    ],
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
  });

  console.log(chatCompletion);

  return NextResponse.json(chatCompletion, { status: 200 });
}
