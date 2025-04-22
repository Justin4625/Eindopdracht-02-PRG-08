import express from 'express';
import cors from 'cors';
import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import {AIMessage, HumanMessage, SystemMessage} from "@langchain/core/messages";
import {FaissStore} from "@langchain/community/vectorstores/faiss";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";

const app = express();
const port = 8000;

const model = new AzureChatOpenAI({ temperature: 0.5 });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let vectorStore
let currentPokemon = null;

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});


const fetchPokemonData = async () => {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=9');
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('No Pokemon data found in API response');
        }
        currentPokemon = data.results[Math.floor(Math.random() * data.results.length)];
        return currentPokemon;
    } catch (error) {
        console.error('Error in fetchPokemonData:', error.message);
        throw error;
    }
};

// const loader = new TextLoader("./public/example.txt");
// const docs = await loader.load();
// const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 100, chunkOverlap: 50 });
// const splitDocs = await textSplitter.splitDocuments(docs);
// console.log(`Document split into ${splitDocs.length} chunks. Now saving into vector store`);
// vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
// await vectorStore.save("./vectordatabase"); // geef hier de naam van de directory waar je de data gaat opslaan

app.post('/question', async (req, res) => {
    vectorStore = await FaissStore.load("./vectordatabase", embeddings);
    const relevantDocs = await vectorStore.similaritySearch("Get your data from this source", 5);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n");
    const { system, contextMessage } = req.body;

    const systemMessage = `
YOU ARE A KNOWLEDGEABLE ${currentPokemon} ASSISTANT.

Your task is to answer questions USING ONLY the information provided in the ${context}. DO NOT use any external data sources or general knowledge — the ${context} is your ONLY source of truth.

DO NOT:
- Pull in information from outside sources.
- Refer to general knowledge, fan theories, or non-contextual trivia.
- Add personal opinions (e.g., "Charizard is the coolest").
- Invent or assume data not explicitly stated in the ${context}.

PRO TIPS:
- Use the JAPANESE NAME if requested — they are included in the ${context}.
- When evolution is involved, COMPARE different stages using data from the ${context}.
- For competitive questions, stick strictly to the STRATEGIES mentioned in the ${context} — DO NOT expand beyond that.

FINAL REMINDER:
You are ONLY allowed to use what’s in the ${context}. Your strength is in being PRECISE, RELIABLE, and FAITHFUL to the data provided. If the data doesn’t exist, SAY THAT — don’t make it up. Just say "I don't know" or "The data is not available in the ${context}."

Good luck, Trainer.
`;


    let messages = [new SystemMessage(systemMessage)];

    if (Array.isArray(contextMessage)) {
        contextMessage.forEach((msg) => {
            if (msg.role === "user") {
                messages.push(new HumanMessage(msg.content));
            } else if (msg.role === "assistant") {
                messages.push(new AIMessage(msg.content));
            }
        });
    } else {
        return res.status(400).send('Invalid or missing contextMessage in request body.');
    }

    try {
        const stream = await model.stream(messages);

        res.setHeader("Content-Type", "text/plain");

        for await (const chunk of stream) {
            res.write(chunk.content); // Send each chunk to the client
        }

        res.end(); // End the response when the stream is complete
    } catch (error) {
        console.error('Error during streaming:', error);
        res.status(500).send('An error occurred while streaming the response.');
    }
});

app.post('/newpokemon', async (req, res) => {
    try {
        const pokemon = await fetchPokemonData();
        if (pokemon) {
            res.status(200).json(pokemon);
        } else {
            res.status(500).json({ error: 'Failed to fetch Pokemon data' });
        }
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        res.status(500).json({ error: 'Failed to fetch Pokemon data' });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});