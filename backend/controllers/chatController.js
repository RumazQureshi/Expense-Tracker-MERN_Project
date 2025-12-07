const { GoogleGenerativeAI } = require("@google/generative-ai");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Chat = require("../models/Chat");

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "API Key not configured. Please add GEMINI_API_KEY to your .env file."
            });
        }

        await Chat.create({ userId, message, role: 'user' });

        const income = await Income.find({ userId });
        const expense = await Expense.find({ userId });

        const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = expense.reduce((acc, curr) => acc + curr.amount, 0);
        const totalBalance = totalIncome - totalExpense;

        const recentTransactions = [
            ...income.map(i => ({ ...i.toObject(), type: 'income' })),
            ...expense.map(e => ({ ...e.toObject(), type: 'expense' }))
        ].sort((a, b) => b.date - a.date).slice(0, 10);

        const prompt = `
      You are a dedicated financial assistant for an Expense Tracker application.
      Your role is to analyze the user's financial data and answer questions related to their finances, spending habits, income, and budget.

      STRICT RULES:
      1. You are a financial assistant. Answer financial questions using the user's data.
      2. For general pleasantries (e.g., "Hi", "How are you?", "Thanks"), reply politely and naturally in the user's language.
      3. For specific non-financial questions (e.g., "Who is the president?", "What is the weather?", "Write a poem"), politely refuse by saying (in the user's language): "I'm sorry, I can only help with finance-related questions."
      4. Be concise and direct.
      5. Detect the language of the user's question and answer in the SAME language.
      6. if asked who created you reply politely and naturally in the user's language "I'm an AI assistant created by Rumaz Qureshi."
      User's Financial Data:
      - Total Balance: ${totalBalance}
      - Total Income: ${totalIncome}
      - Total Expenses: ${totalExpense}
      
      Recent Transactions (Last 10):
      ${JSON.stringify(recentTransactions.map(t => ({
            date: t.date,
            amount: t.amount,
            type: t.type,
            category: t.category || t.source,
            description: t.description
        })))}

      User Question: "${message}"
    `;

        const modelName = "gemini-2.0-flash";
        console.log(`Initializing Gemini with model: ${modelName}`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        await Chat.create({ userId, message: text, role: 'system' });

        res.json({ reply: text });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({
            message: "Failed to generate response",
            error: error.message,
            details: error.toString()
        });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await Chat.find({ userId }).sort({ createdAt: 1 });
        res.json(history);
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: "Failed to fetch chat history" });
    }
};

exports.deleteChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        await Chat.deleteMany({ userId });
        res.json({ message: "Chat history deleted successfully" });
    } catch (error) {
        console.error("Delete History Error:", error);
        res.status(500).json({ message: "Failed to delete chat history" });
    }
};
