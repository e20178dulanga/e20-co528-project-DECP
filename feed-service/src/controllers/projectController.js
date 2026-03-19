const Project = require('../models/Project');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadFiles = upload.array('files', 5);

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

    const project = await Project.create({
      title,
      description,
      owner: req.user.id,
      ownerName: req.user.name,
      collaborators: []
    });
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'collaborators.user': req.user.id }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addCollaborator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, userName } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can add collaborators' });

    if (!project.collaborators.find(c => c.user.toString() === userId)) {
      project.collaborators.push({ user: userId, name: userName });
      await project.save();
    }
    res.status(200).json({ project });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

const uploadDocuments = [
  uploadFiles,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      const isAllowed = project.owner.toString() === req.user.id || project.collaborators.some(c => c.user.toString() === req.user.id);
      if (!isAllowed) return res.status(403).json({ message: 'Not allowed' });

      const files = (req.files || []).map(file => ({
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        type: 'document',
        filename: file.originalname
      }));

      project.documents.push(...files);
      await project.save();

      res.status(200).json({ project });
    } catch(err) {
      res.status(500).json({ message: err.message });
    }
  }
];

const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can edit' });

    project.title = title || project.title;
    project.description = description || project.description;
    await project.save();

    res.status(200).json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can delete' });

    await project.deleteOne();
    res.status(200).json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createProject, getProjects, addCollaborator, uploadDocuments, updateProject, deleteProject };
