const xlsx = require('xlsx');
const Income = require("../models/Income");

// Add Income Source
exports.addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, date } = req.body;

    // Validation: Check for missing fields
    if (!source || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validation: Check for negative amount
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const newIncome = new Income({
      userId,
      icon,
      source: source.charAt(0).toUpperCase() + source.slice(1),
      amount,
      date: new Date(date),
    });

    await newIncome.save();

    res.status(200).json(newIncome);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Income Source
exports.getAllIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await Income.findOne({ _id: req.params.id, userId });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: "Income Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Income
exports.updateIncome = async (req, res) => {
  const userId = req.user.id;
  const incomeId = req.params.id;
  const { icon, source, amount, date } = req.body;

  try {
    const income = await Income.findOne({ _id: incomeId, userId });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    // Update fields
    if (icon) income.icon = icon;
    if (source) income.source = source.charAt(0).toUpperCase() + source.slice(1);
    if (amount) {
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }
      income.amount = amount;
    }
    if (date) income.date = new Date(date);

    await income.save();
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Download Excel
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const data = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date ? new Date(item.date).toLocaleDateString() : '',
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");

    // Write to buffer instead of file
    const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // Send buffer as response
    res.setHeader('Content-Disposition', 'attachment; filename="income_details.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
