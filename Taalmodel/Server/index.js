import express from 'express';
import {AzureChatOpenAI} from "@langchain/openai";
import { HumanMessage, SystemMessage} from "@langchain/core/messages";
import cors from 'cors';

const app = express();
const port = 8000;

const model = new AzureChatOpenAI({ temperature: 0.5 });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.post('/joke', async (req, res) => {
    const chat = await model.invoke("Can you tell me a joke?");
    console.log(chat.content)

    res.json({
        joke: chat.content
    })
});

app.post('/question', async (req, res) => {
    const question = req.body.question;
    const messages = [
        new SystemMessage("Be like a france student that speaks english with france words."),
        new HumanMessage(question),
    ];

    const chat = await model.invoke(messages);
    console.log(chat.content)

    res.json({
        question: chat.content
    })
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});