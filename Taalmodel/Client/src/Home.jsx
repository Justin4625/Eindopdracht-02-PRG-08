import { useState } from "react";

function Home() {
    const [humanMessage, setHumanMessage] = useState("");
    const [response, setResponse] = useState("");
    const [context, setContext] = useState([]);
    const [loading, setLoading] = useState(false);
    const [randomPokemon, setRandomPokemon] = useState("");

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        const newMessage = { role: "user", content: humanMessage };
        const updatedContext = [...context, newMessage];

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
                setResponse((prev) => prev + chunk);
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
            setRandomPokemon(data.name);
            setContext((prev) => [...prev, { role: "assistant", content: data.name }]);
        } catch (error) {
            console.error('Error fetching Pokemon data:', error);
            setRandomPokemon("Failed to fetch Pokémon data");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-500 to-red-700 text-white font-mono p-8">
            <h1 className="text-4xl text-center mb-8 border-b-4 border-cyan-400 pb-2">
                Pokédex Chat Bot
            </h1>

            <button
                onClick={fetchRandomPokemon}
                className="bg-gray-800 text-cyan-400 py-2 px-4 rounded-lg hover:bg-gray-700 transition shadow-lg"
                disabled={loading}
            >
                {loading ? "Loading..." : "Random Pokémon"}
            </button>

            {randomPokemon && (
                <div className="mt-4 text-center bg-gray-900 p-4 rounded-lg shadow-lg">
                    <h2 className="text-2xl text-cyan-400">Random Pokémon:</h2>
                    <p className="text-lg">{randomPokemon}</p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-8 border-2 border-cyan-400"
            >
                <div className="mb-4">
                    <label className="block text-cyan-400 mb-2">
                        Human Message:
                    </label>
                    <textarea
                        value={humanMessage}
                        onChange={(e) => setHumanMessage(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-cyan-400 text-black py-2 rounded-lg hover:bg-cyan-500 transition shadow-lg"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Submit"}
                </button>
            </form>

            {response && (
                <div className="mt-8 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-lg mx-auto">
                    <h2 className="text-2xl text-cyan-400 mb-2">Response:</h2>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
}

export default Home;