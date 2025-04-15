import express from 'express';
import cors from 'cors';
import {AzureChatOpenAI} from "@langchain/openai";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";

const app = express();
const port = 8000;

const model = new AzureChatOpenAI({temperature: 0.5});

let messages = [];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/question', async (req, res) => {
    const question = req.body.question;
    const system = req.body.system;

    messages.push(new SystemMessage(system));
    messages.push(new HumanMessage(question));

    try {
        const chat = await model.invoke(messages);
        messages.push(chat);

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