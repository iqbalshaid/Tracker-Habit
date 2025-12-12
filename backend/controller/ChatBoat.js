
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
// LangChain pipeline
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",   // ya koi bhi LLM
  apiKey: process.env.OPENAI_API_KEY
});

// Prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an AI assistant. Respond very clearly."],
  ["user", "{input}"]
]);

// Chain
const chain = RunnableSequence.from([prompt, llm]);
// ChatBot controller
export const getChatResponse = async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("Chat response:");
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }   
    const response = await chain.invoke({ input: userMessage });
    
    res.status(200).json({ response: response.text });
  } catch (error) {
    console.error("Error getting chat response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }     
}
