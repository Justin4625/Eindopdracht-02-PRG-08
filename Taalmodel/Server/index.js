import express from 'express';
import cors from 'cors';
import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {FaissStore} from "@langchain/community/vectorstores/faiss";

const app = express();
const port = 8000;

const model = new AzureChatOpenAI({ temperature: 0.5 });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let vectorStore

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

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

    const systemMessage = `use information from the ${context} to answer the question`;

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

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});