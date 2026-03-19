const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url: String,
  type: String,
  filename: String,
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerName: { type: String, required: true },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  }],
  documents: [fileSchema]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
