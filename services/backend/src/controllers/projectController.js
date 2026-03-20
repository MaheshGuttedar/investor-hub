const Project = require('../models/Project');
const Investment = require('../models/Investment');

const getRaisedTotals = async (projectIds) => {
  const match = projectIds ? { $match: { project: { $in: projectIds } } } : null;
  const pipeline = [
    ...(match ? [match] : []),
    { $group: { _id: '$project', total: { $sum: '$amount' } } }
  ];
  const totals = await Investment.aggregate(pipeline);
  return new Map(totals.map((item) => [String(item._id), item.total]));
};

const list = async (req, res) => {
  let projectQuery = {};
  let projectIds = null;

  if (req.userRole !== 'admin') {
    const investments = await Investment.find({ user: req.userId }).select('project').lean();
    projectIds = investments.map((inv) => inv.project);
    projectQuery = { _id: { $in: projectIds } };
  }

  const [projects, raisedMap] = await Promise.all([
    Project.find(projectQuery).sort({ createdAt: -1 }).lean(),
    getRaisedTotals(projectIds),
  ]);

  const hydrated = projects.map((project) => ({
    ...project,
    currentRaised: raisedMap.get(String(project._id)) || project.currentRaised || 0,
  }));

  res.json({ projects: hydrated });
};

const getOne = async (req, res) => {
  const project = await Project.findById(req.params.id).lean();
  if (!project) return res.status(404).json({ error: 'Not found' });

  const totals = await Investment.aggregate([
    { $match: { project: project._id } },
    { $group: { _id: '$project', total: { $sum: '$amount' } } }
  ]);

  const currentRaised = totals[0]?.total || project.currentRaised || 0;
  res.json({ project: { ...project, currentRaised } });
};

const create = async (req, res) => {
  const data = req.body;
  if (!data?.title) {
    return res.status(400).json({ error: 'Project title is required' });
  }
  const project = new Project(data);
  await project.save();
  res.status(201).json({ project });
};

const update = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json({ project });
};

const remove = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};

module.exports = { list, getOne, create, update, remove };
