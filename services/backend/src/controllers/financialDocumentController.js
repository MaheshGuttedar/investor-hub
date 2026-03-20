const FinancialDocument = require('../models/FinancialDocument');

const list = async (req, res) => {
  const query = req.userRole === 'admin' ? {} : { investingEntity: { $in: req.userEntities } };
  const financialDocuments = await FinancialDocument.find(query).sort({ year: -1, createdAt: -1 });
  res.json({ financialDocuments });
};

const create = async (req, res) => {
  const { name, investingEntity, year, sharedDate, projectName, asset, category, url } = req.body;
  if (!name || !investingEntity || !year || !sharedDate || !projectName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const financialDocument = await FinancialDocument.create({
    name,
    investingEntity,
    asset,
    category,
    year,
    sharedDate,
    projectName,
    url,
  });

  res.status(201).json({ financialDocument });
};

module.exports = { list, create };
