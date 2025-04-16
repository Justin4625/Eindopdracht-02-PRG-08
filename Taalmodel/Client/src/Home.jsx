import { useState } from "react";

function Home() {
    // const [systemMessage, setSystemMessage] = useState("");
    const [humanMessage, setHumanMessage] = useState("");
    const [response, setResponse] = useState("");
    const [context, setContext] = useState([]); // Houdt de context bij

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newMessage = { role: "user", content: humanMessage };
        const updatedContext = [...context, newMessage];

        // Clear the response state before starting
        setResponse("");

        try {
            const res = await fetch('http://localhost:8000/question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // system: systemMessage,
                    contextMessage: updatedContext,
                }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let result = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                result += chunk;
                setResponse((prev) => prev + chunk); // Append the chunk to the response
            }

            setContext([...updatedContext, { role: "assistant", content: result }]);
        } catch (error) {
            console.error('Error:', error);
            setResponse('An error occurred while processing your request.');
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-bold p-8">
            <h1 className="text-4xl text-center mb-8">Temu Chat Bot</h1>

            <form
                onSubmit={handleSubmit}
                className="bg-black text-white p-6 rounded-lg shadow-lg max-w-lg mx-auto"
            >
                {/*<div className="mb-4">*/}
                {/*    <label className="block text-yellow-400 mb-2">*/}
                {/*        System Message:*/}
                {/*    </label>*/}
                {/*    <textarea*/}
                {/*        value={systemMessage}*/}
                {/*        onChange={(e) => setSystemMessage(e.target.value)}*/}
                {/*        className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"*/}
                {/*    />*/}
                {/*</div>*/}
                <div className="mb-4">
                    <label className="block text-yellow-400 mb-2">
                        Human Message:
                    </label>
                    <textarea
                        value={humanMessage}
                        onChange={(e) => setHumanMessage(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-500 transition"
                >
                    Submit
                </button>
            </form>

            {response && (
                <div className="mt-8 bg-white text-black p-4 rounded-lg shadow-lg max-w-lg mx-auto">
                    <h2 className="text-2xl mb-2">Response:</h2>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
}

export default Home;