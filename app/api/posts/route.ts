import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env["GROQ_API_KEY"],
});

export async function POST(req: Request) {
  const { input } = await req.json();

  if (!input || input.trim() === "") {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  const responseChunks: string[] = [];

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an AI that generates JSON-formatted cryptocurrency-related social media posts. Each post should include an `id`, `imageUrl`, `caption`, `crypto`, `timestamp`, `likes`, `comments`, `shares`, `username`, `userHandle`, `verified` status, and `avatarUrl`. \n\nFollow this structure:\n```json\n{\n  \"id\": \"1\",\n  \"imageUrl\": \"/placeholder.svg?height=600&width=800\",\n  \"caption\": \"Just bought more #Bitcoin during this dip! 📉➡️📈 Remember, it's not about timing the market, it's about time IN the market. HODL strong, friends! 💎🙌 #Crypto #BTC #ToTheMoon\",\n  \"crypto\": \"Bitcoin\",\n  \"timestamp\": \"2h ago\",\n  \"likes\": 3452,\n  \"comments\": 128,\n  \"shares\": 76,\n  \"username\": \"BitcoinBaron\",\n  \"userHandle\": \"bitcoin_baron\",\n  \"verified\": true,\n  \"avatarUrl\": \"/placeholder.svg?height=40&width=40\"\n}\n```\n\n### Guidelines:\n1. **`id`**: A unique string-based identifier (e.g., \"1\", \"2\", \"3\", etc.).\n2. **`imageUrl`**: A placeholder image with dimensions 600x800.\n3. **`caption`**: A dynamic crypto-related post, including hashtags and emojis.\n4. **`crypto`**: The associated cryptocurrency, such as \"Bitcoin\", \"Ethereum\", \"Dogecoin\", or \"Solana\".\n5. **`timestamp`**: A relative time indicator like \"2h ago\", \"5h ago\", \"1d ago\", \"3d ago\".\n6. **`likes`**: A random integer between 1,000 and 10,000.\n7. **`comments`**: A random integer between 50 and 500.\n8. **`shares`**: A random integer between 20 and 250.\n9. **`username`**: A creative crypto-related name.\n10. **`userHandle`**: A lowercase handle derived from the username, replacing spaces with underscores.\n11. **`verified`**: A boolean value (`true` or `false`) indicating account verification.\n12. **`avatarUrl`**: A placeholder image with dimensions 40x40.\n\nGenerate a JSON array containing multiple posts that match this format, ensuring variety in usernames, captions, and engagement metrics."
      },
      {
        role: "user",
        content: input,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    max_tokens: 4096,
    top_p: 0.95,
    stream: true,
    stop: null,
  });

  for await (const chunk of chatCompletion) {
    const content = chunk.choices[0]?.delta?.content || "";
    responseChunks.push(content);
  }

  const fullResponse = responseChunks.join("").trim();

  console.log(fullResponse)

  const jsonMatch = fullResponse.match(/```json([\s\S]*?)```/);
  let jsonString = jsonMatch ? jsonMatch[1].trim() : fullResponse;

  const parsedJSON = JSON.parse(jsonString);
  return NextResponse.json(parsedJSON, { status: 200 });
}