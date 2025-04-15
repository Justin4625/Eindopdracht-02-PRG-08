import express from 'express';
import cors from 'cors';
import { AzureChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const app = express();
const port = 8000;

const model = new AzureChatOpenAI({ temperature: 0.5 });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/question', async (req, res) => {
    const { system, context } = req.body;

    let messages = [new SystemMessage(system)];

    context.forEach((msg) => {
        if (msg.role === "user") {
            messages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
            messages.push(new AIMessage(msg.content));
        }
    });

    try {
        const chat = await model.invoke(messages);

        res.json({
            answer: chat.content,
        });
    } catch (error) {
        console.error('Error processing the question:', error);
        res.status(500).json({
            error: 'An error occurred while processing your request.',
        });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});