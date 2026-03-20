const TaxDocument = require('../models/TaxDocument');

const list = async (req, res) => {
  const query = req.userRole === 'admin' ? {} : { investingEntity: { $in: req.userEntities } };
  const taxDocuments = await TaxDocument.find(query).sort({ year: -1, createdAt: -1 });
  res.json({ taxDocuments });
};

const create = async (req, res) => {
  const { name, investingEntity, year, sharedDate, projectName, asset, url, isNew } = req.body;
  if (!name || !investingEntity || !year || !sharedDate || !projectName) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const taxDocument = await TaxDocument.create({
    name,
    investingEntity,
    asset,
    year,
    sharedDate,
    projectName,
    url,
    isNew,
  });

  res.status(201).json({ taxDocument });
};

module.exports = { list, create };
