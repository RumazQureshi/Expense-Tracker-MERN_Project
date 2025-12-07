const xlsx = require('xlsx');
const Expense = require("../models/Expense");

// Add Expense Source
exports.addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    // Validation: Check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validation: Check for negative amount
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const newExpense = new Expense({
      userId,
      icon,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      date: new Date(date),
    });

    await newExpense.save();

    res.status(200).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Expense Source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Expense Source
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expense = await Expense.findOne({ _id: req.params.id, userId });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  const userId = req.user.id;
  const expenseId = req.params.id;
  const { icon, category, amount, date } = req.body;

  try {
    const expense = await Expense.findOne({ _id: expenseId, userId });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Update fields
    if (icon) expense.icon = icon;
    if (category) expense.category = category.charAt(0).toUpperCase() + category.slice(1);
    if (amount) {
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      expense.amount = amount;
    }
    if (date) expense.date = new Date(date);

    await expense.save();
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Download Excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date ? new Date(item.date).toLocaleDateString() : '',
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");

    // Write to buffer instead of file
    const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // Send buffer as response
    res.setHeader('Content-Disposition', 'attachment; filename="expense_details.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
