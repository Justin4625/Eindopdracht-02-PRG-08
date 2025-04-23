# 🧠 Taalmodel Server – Backend

Dit is de backend voor het Taalmodel-project. Het biedt een API waarmee gebruikers vragen kunnen stellen op basis van een tekstuele context. Deze backend gebruikt **LangChain**, **Azure OpenAI**, en een **FAISS vectorstore** om intelligente en contextuele antwoorden te genereren. Er is ook een endpoint dat een willekeurige Pokémon ophaalt via de PokéAPI.

---

## 🚀 Features

- Stel vragen op basis van context opgeslagen in een vectorstore.
- Vectorstore-opbouw uit `.txt`-bestanden via FAISS.
- Real-time AI-antwoorden met behulp van Azure OpenAI (GPT-3.5 Turbo).
- Haal willekeurige Pokémon op via de PokéAPI.

---

## 🛠️ Installation

1. **Clone de repository:**

```bash
git clone https://github.com/your-username/taalmodel-server.git
cd taalmodel-server
