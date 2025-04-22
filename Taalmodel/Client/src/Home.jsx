import { useState } from "react";

function Home() {
    const [humanMessage, setHumanMessage] = useState("");
    const [response, setResponse] = useState("");
    const [context, setContext] = useState([]); // Houdt de context bij
    const [loading, setLoading] = useState(false);
    const [randomPokemon, setRandomPokemon] = useState(""); // Nieuwe state voor de opgehaalde Pokémon

    const handleSubmit = async (e) => {
        setLoading(true);
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
        setLoading(false);
    };

    const fetchRandomPokemon = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/newpokemon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            setRandomPokemon(data.name); // Sla de naam van de opgehaalde Pokémon op
            setContext((prev) => [...prev, { role: "assistant", content: data.name }]);
        } catch (error) {
            console.error('Error fetching Pokemon data:', error);
            setRandomPokemon("Failed to fetch Pokémon data"); // Toon een foutmelding
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white text-black font-bold p-8">
            <h1 className="text-4xl text-center mb-8">Temu Chat Bot</h1>

            <button
                onClick={fetchRandomPokemon}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                disabled={loading}
            >
                {loading ? "Loading..." : "Random Pokémon"}
            </button>

            {/* Toon de opgehaalde Pokémon */}
            {randomPokemon && (
                <div className="mt-4 text-center">
                    <h2 className="text-2xl">Random Pokémon:</h2>
                    <p className="text-lg">{randomPokemon}</p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-black text-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-8"
            >
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
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Submit"}
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