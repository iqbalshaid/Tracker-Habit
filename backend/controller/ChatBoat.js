import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import  logger  from "../Middleware/logger.js";

// LangChain pipeline
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY
});

// Prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an AI assistant. Respond very clearly."],
  ["user", "{input}"]
]);

const chain = RunnableSequence.from([prompt, llm]);

// Chat response
export const getChatResponse = async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      logger.warnWithContext("Chat message missing", req);
      return res.status(400).json({ error: "Message is required" });
    }

    logger.infoWithContext("Invoking LLM for chat", req, { userMessage });

    const response = await chain.invoke({ input: userMessage });

    logger.infoWithContext("Chat response received", req, { response: response.text });
    res.status(200).json({ response: response.text });
  } catch (error) {
    logger.errorWithContext("Error getting chat response", error, req);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
