require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Investment = require('../src/models/Investment');
const Transaction = require('../src/models/Transaction');
const TaxDocument = require('../src/models/TaxDocument');
const FinancialDocument = require('../src/models/FinancialDocument');

async function upsertUser({ name, email, phone = '', password = 'password123', role = 'user', isApproved = true, entities = [] }) {
  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.phone = phone;
    existing.role = role;
    existing.isApproved = isApproved;
    if (entities.length > 0) existing.entities = entities;
    if (isApproved && !existing.approvedAt) {
      existing.approvedAt = new Date();
    }
    await existing.save();
    return existing;
  }
  const u = new User({ name, email, phone, password, role, isApproved, entities, approvedAt: isApproved ? new Date() : null });
  await u.save();
  return u;
}

async function upsertProject({ title, description = '', location = '', images = [], targetRaise = 0, targetIrr }) {
  const existing = await Project.findOne({ title });
  if (existing) return existing;
  const p = new Project({ title, description, location, images, targetRaise, targetIrr });
  await p.save();
  return p;
}

async function createInvestment({ userId, projectId, amount, date }) {
  const inv = new Investment({ user: userId, project: projectId, amount, createdAt: date });
  await inv.save();
  return inv;
}

async function upsertTransaction(item) {
  const exists = await Transaction.findOne({
    projectName: item.projectName,
    type: item.type,
    amount: item.amount,
    entity: item.entity,
    date: new Date(item.date)
  });

  if (exists) return exists;
  const doc = new Transaction({ ...item, date: new Date(item.date) });
  await doc.save();
  return doc;
}

async function upsertTaxDocument(item) {
  const exists = await TaxDocument.findOne({
    name: item.name,
    projectName: item.projectName,
    year: item.year
  });

  if (exists) return exists;
  const doc = new TaxDocument(item);
  await doc.save();
  return doc;
}

async function upsertFinancialDocument(item) {
  const exists = await FinancialDocument.findOne({
    name: item.name,
    projectName: item.projectName,
    year: item.year
  });

  if (exists) return exists;
  const doc = new FinancialDocument(item);
  await doc.save();
  return doc;
}

async function run() {
  try {
    await connectDB();

    console.log('Seeding sample users...');
    await upsertUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true,
    });

    const userForge = await upsertUser({
      name: 'Xyz Trust ABC Account No 1234',
      email: 'forge-trust@example.com',
      password: 'password123',
      entities: ['Siffi LLC'],
    });

    const userAPV = await upsertUser({
      name: 'APV Retirement LLC',
      email: 'apv-retirement@example.com',
      password: 'password123',
      entities: ['IRA Services Trust FBO ABC', 'APV Retirement LLC'],
    });

    console.log('Seeding sample projects...');
    const projectCelina = await upsertProject({
      title: 'CelinaMA',
      description: 'Project found in Celina, TX',
      location: 'Mark Alexander Ct and Kristina Ct, Celina, TX',
      images: []
    });

    const projectLeander = await upsertProject({
      title: 'Leander282',
      description: 'Parcel in Leander, TX',
      location: '3360 County Road 282, Leander, TX',
      images: []
    });

    console.log('Seeding sample investments...');

    // Replace sample investments for the seeded users/projects so reruns stay deterministic.
    await Investment.deleteMany({
      user: { $in: [userForge._id, userAPV._id] },
      project: { $in: [projectCelina._id, projectLeander._id] }
    });

    const rows = [
      { user: userForge, project: projectCelina, amount: 100000, date: '2025-07-31' },
      { user: userAPV, project: projectLeander, amount: 12000, date: '2025-03-31' },
      { user: userAPV, project: projectLeander, amount: 12000, date: '2024-03-31' },
      { user: userAPV, project: projectLeander, amount: 12000, date: '2023-03-31' }
    ];

    for (const r of rows) {
      const inv = await createInvestment({ userId: r.user._id, projectId: r.project._id, amount: r.amount, date: new Date(r.date) });
      console.log('Inserted investment', inv._id.toString(), r.user.name, r.project.title, r.amount, r.date);
    }

    console.log('Seeding sample transactions...');
    const transactions = [
      { projectName: 'Lakes at Renaissance', type: 'distribution', amount: 3500, status: 'completed', entity: 'Siffi LLC', date: '2025-01-15' },
      { projectName: 'Princeton Parc', type: 'distribution', amount: 12500, status: 'completed', entity: 'IRA Services Trust FBO ABC', date: '2024-10-01' },
      { projectName: 'Lakes at Renaissance', type: 'distribution', amount: 3500, status: 'completed', entity: 'Siffi LLC', date: '2024-07-15' },
      { projectName: 'Princeton Parc', type: 'distribution', amount: 12500, status: 'completed', entity: 'IRA Services Trust FBO ABC', date: '2024-04-01' },
      { projectName: 'Harbor Point', type: 'return', amount: 145000, status: 'completed', entity: 'Greenfield Ventures LLC', date: '2023-12-15' },
      { projectName: 'Summit Ridge', type: 'investment', amount: 300000, status: 'completed', entity: 'Greenfield Ventures LLC', date: '2023-06-01' },
      { projectName: 'Princeton Parc', type: 'investment', amount: 500000, status: 'completed', entity: 'IRA Services Trust FBO ABC', date: '2022-03-01' },
      { projectName: 'Lakes at Renaissance', type: 'investment', amount: 250000, status: 'completed', entity: 'Siffi LLC', date: '2021-08-15' }
    ];

    for (const item of transactions) {
      await upsertTransaction(item);
    }

    console.log('Seeding sample tax documents...');
    const taxDocuments = [
      {
        name: '2024US P180089.552 K1P V1_41 IRA Trust Services FBO ABC_41.pdf',
        investingEntity: 'IRA Services Trust FBO ABC',
        asset: '--',
        year: 2025,
        sharedDate: '04/25/25',
        projectName: 'Princeton Parc',
        url: '#',
        isNew: true,
      },
      {
        name: '2024_SIFFI LLC_4646_K1_Partnership.pdf',
        investingEntity: 'Siffi LLC',
        asset: '--',
        year: 2025,
        sharedDate: '03/19/25',
        projectName: 'Lakes at Renaissance',
        url: '#',
        isNew: true,
      },
      {
        name: 'IRA TRUST SERVICES FBO ABC_K1 2023 EM PRINCETON PARC GREEN LLC.pdf',
        investingEntity: 'IRA Services Trust FBO ABC',
        asset: '--',
        year: 2024,
        sharedDate: '03/21/24',
        projectName: 'Princeton Parc',
        url: '#',
      },
      {
        name: '2022 EM Princeton Parc Green LLC K-1 - 106 IRA Trust Services FBO ABC.pdf',
        investingEntity: 'IRA Services Trust FBO ABC',
        asset: '--',
        year: 2023,
        sharedDate: '08/10/23',
        projectName: 'Princeton Parc',
        url: '#',
      }
    ];

    for (const item of taxDocuments) {
      await upsertTaxDocument(item);
    }

    console.log('Seeding sample financial documents...');
    const financialDocuments = [
      {
        name: 'Q1 2025 Investor Update - Lakes at Renaissance.pdf',
        investingEntity: 'Siffi LLC',
        asset: '--',
        category: 'Investor Update',
        year: 2025,
        sharedDate: '04/30/25',
        projectName: 'Lakes at Renaissance',
        url: '#',
      },
      {
        name: 'Q4 2024 Distribution Notice - Princeton Parc.pdf',
        investingEntity: 'IRA Services Trust FBO ABC',
        asset: '--',
        category: 'Distribution Notice',
        year: 2024,
        sharedDate: '10/10/24',
        projectName: 'Princeton Parc',
        url: '#',
      },
      {
        name: '2023 Annual Financials - Harbor Point.pdf',
        investingEntity: 'Greenfield Ventures LLC',
        asset: '--',
        category: 'Annual Financials',
        year: 2023,
        sharedDate: '12/20/23',
        projectName: 'Harbor Point',
        url: '#',
      }
    ];

    for (const item of financialDocuments) {
      await upsertFinancialDocument(item);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
