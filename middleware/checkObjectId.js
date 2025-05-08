import mongoose from 'mongoose';

const checkObjectId = (idToCheck) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[idToCheck])) {
    return res.status(404).json({ message: 'Invalid ID format' });
  }
  next();
};

export default checkObjectId;
