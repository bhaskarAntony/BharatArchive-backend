const Entry = require('../models/Entry');

exports.getAllEntries = async (req, res) => {
  try {
    const { search, category, sort = '-createdAt', page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const entries = await Entry.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name')
      .exec();

    const count = await Entry.countDocuments(query);

    res.json({
      entries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEntryById = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('comments.user', 'name');

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.views += 1;
    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEntryBySlug = async (req, res) => {
  try {
    const entry = await Entry.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name')
      .populate('comments.user', 'name');

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.views += 1;
    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const { title, category, imageUrls, content, location, metaDescription, keywords } = req.body;

    const entry = new Entry({
      title,
      category,
      imageUrls,
      content,
      location,
      metaDescription,
      keywords,
      createdBy: req.userId
    });

    await entry.save();
    res.status(201).json({ message: 'Entry created successfully', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { title, category, imageUrls, content, location, metaDescription, keywords } = req.body;

    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (title) entry.title = title;
    if (category) entry.category = category;
    if (imageUrls) entry.imageUrls = imageUrls;
    if (content) entry.content = content;
    if (location) entry.location = location;
    if (metaDescription !== undefined) entry.metaDescription = metaDescription;
    if (keywords) entry.keywords = keywords;

    await entry.save();
    res.json({ message: 'Entry updated successfully', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.likeEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const likeIndex = entry.likes.indexOf(req.userId);

    if (likeIndex > -1) {
      entry.likes.splice(likeIndex, 1);
    } else {
      entry.likes.push(req.userId);
    }

    await entry.save();
    res.json({ message: 'Like toggled', likes: entry.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.comments.push({
      user: req.userId,
      userName: req.user.name,
      text
    });

    await entry.save();

    const populatedEntry = await Entry.findById(entry._id)
      .populate('comments.user', 'name');

    res.status(201).json({
      message: 'Comment added',
      comments: populatedEntry.comments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const comment = entry.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.remove();
    await entry.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
