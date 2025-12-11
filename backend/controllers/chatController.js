const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Chat = require("../models/Chat");

const User = require("../models/User");

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        // 1. Log User Message
        await Chat.create({ userId, message, role: 'user' });

        // 2. Fetch Data for Context
        const user = await User.findById(userId);
        const income = await Income.find({ userId });
        const expense = await Expense.find({ userId });

        const currency = user ? user.currency : "USD";

        const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = expense.reduce((acc, curr) => acc + curr.amount, 0);
        const totalBalance = totalIncome - totalExpense;

        const recentTransactions = [
            ...income.map(i => ({ ...i.toObject(), type: 'income' })),
            ...expense.map(e => ({ ...e.toObject(), type: 'expense' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        // 3. Process Message (Rule-Based Intent)
        const msg = message.toLowerCase();
        let reply = "";

        if (msg.includes("balance") || msg.includes("money") || msg.includes("left")) {
            reply = `Your total current balance is ${totalBalance} ${currency}.`;
        } else if (msg.includes("income") || msg.includes("earned")) {
            reply = `Your total recorded income is ${totalIncome} ${currency}.`;
        } else if (msg.includes("expense") || msg.includes("spent") || msg.includes("spend")) {
            reply = `You have spent a total of ${totalExpense} ${currency}.`;
        } else if (msg.includes("recent") || msg.includes("transaction") || msg.includes("last")) {
            if (recentTransactions.length === 0) {
                reply = "You don't have any recent transactions.";
            } else {
                reply = "Here are your last 5 transactions:\n";
                recentTransactions.forEach(t => {
                    reply += `- ${t.type.toUpperCase()}: ${t.amount} ${currency} (${t.category || t.source || 'N/A'})\n`;
                });
            }
        } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
            reply = "Hello! I am your financial assistant. Ask me about your balance, income, or expenses.";
        } else if (msg.includes("who created you")) {
            reply = "I'm an AI assistant created by Rumaz Qureshi.";
        } else {
            reply = "I'm sorry, I can only help with basic financial queries like 'Check Balance', 'Total Income', or 'Recent Transactions'.";
        }

        // 4. Save & Send Response
        await Chat.create({ userId, message: reply, role: 'system' });
        res.json({ reply });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({
            message: "Failed to process message",
            error: error.message
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
