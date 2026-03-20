const Transaction = require('../models/Transaction');

const list = async (req, res) => {
  const query = req.userRole === 'admin' ? {} : { entity: { $in: req.userEntities } };
  const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
  res.json({ transactions });
};

const create = async (req, res) => {
  const { projectName, type, amount, status, entity, date, investmentName } = req.body;
  if (!projectName || !type || !amount || !entity || !date) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const transaction = await Transaction.create({
    projectName,
    type,
    amount,
    status,
    entity,
    date,
    investmentName,
  });

  res.status(201).json({ transaction });
};

module.exports = { list, create };
