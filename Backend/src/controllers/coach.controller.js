import Coach from '../models/coach.model.js';
import User from '../models/user.model.js'; // Assuming you have a User model
import { PROFILE_STATUS, PAGINATION } from '../config/constants.js';
import mongoose from 'mongoose';

export const createCoach = async (req, res) => {
  try {
    const { id } = req.user;
    const coachData = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

  
    const existingCoach = await Coach.findOne({ user: id });
    if (existingCoach) {
      return res.status(400).json({
        success: false,
        message: 'Coach profile already exists for this user'
      });
    }

    const coach = new Coach(coachData);
    await coach.save();

    await coach.populate('user', 'email username');

    res.status(201).json({
      success: true,
      message: 'Coach created successfully',
      data: coach
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating coach',
      error: error.message
    });
  }
};

export const getAllCoaches = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      category,
      nationality,
      status,
      gender,
      minAge,
      maxAge,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPromoted
    } = req.query;

    const filter = { isActive: true };

    if (category) {filter.category = category;}
    if (nationality) {filter.nationality = nationality;}
    if (status) {filter.status = status;}
    if (gender) {filter.gender = gender;}
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) {filter.age.$gte = parseInt(minAge);}
      if (maxAge) {filter.age.$lte = parseInt(maxAge);}
    }

    if (search) {
      filter.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { nationality: { $regex: search, $options: 'i' } }
      ];
    }

    if (isPromoted === 'true') {
      filter['isPromoted.status'] = true;
      filter['isPromoted.endDate'] = { $gt: new Date() };
    }

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const coaches = await Coach.find(filter)
      .populate('user', 'email username')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Coach.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: coaches,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coaches',
      error: error.message
    });
  }
};

export const getCoachById = async (req, res) => {
  try {
    const { id } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coach ID'
      });
    }

    const coach = await Coach.findById(id).populate('user', 'email username');

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    coach.views += 1;
    await coach.save();

    res.status(200).json({
      success: true,
      data: coach
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coach',
      error: error.message
    });
  }
};

export const updateCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coach ID'
      });
    }

    const coach = await Coach.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('user', 'email username');

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coach updated successfully',
      data: coach
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating coach',
      error: error.message
    });
  }
};

export const deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coach ID'
      });
    }

    const coach = await Coach.findByIdAndDelete(id);

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coach deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting coach',
      error: error.message
    });
  }
};

export const promoteCoach = async (req, res) => {
  try {
    const { id } = req.user;
    const { days, type = 'featured' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coach ID'
      });
    }

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid number of days is required'
      });
    }

    const coach = await Coach.findById(id);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    await coach.promote(days, type);

    res.status(200).json({
      success: true,
      message: 'Coach promoted successfully',
      data: coach
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error promoting coach',
      error: error.message
    });
  }
};

export const transferCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { clubName, amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coach ID'
      });
    }

    if (!clubName) {
      return res.status(400).json({
        success: false,
        message: 'Club name is required'
      });
    }

    const coach = await Coach.findById(id);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    await coach.transfer(clubName, amount);

    res.status(200).json({
      success: true,
      message: 'Coach transferred successfully',
      data: coach
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error transferring coach',
      error: error.message
    });
  }
};

export const getCoachesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } =
      req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const coaches = await Coach.find({
      category,
      isActive: true,
      status: PROFILE_STATUS.AVAILABLE
    })
      .populate('user', 'email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Coach.countDocuments({
      category,
      isActive: true,
      status: PROFILE_STATUS.AVAILABLE
    });

    res.status(200).json({
      success: true,
      data: coaches,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coaches by category',
      error: error.message
    });
  }
};

export const getPromotedCoaches = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      type
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      isActive: true,
      'isPromoted.status': true,
      'isPromoted.endDate': { $gt: new Date() }
    };

    if (type) {
      filter['isPromoted.type'] = type;
    }

    const coaches = await Coach.find(filter)
      .populate('user', 'email username')
      .sort({ 'isPromoted.startDate': -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Coach.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: coaches,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching promoted coaches',
      error: error.message
    });
  }
};

export const getCoachStats = async (req, res) => {
  try {
    const stats = await Coach.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCoaches: { $sum: 1 },
          availableCoaches: {
            $sum: {
              $cond: [{ $eq: ['$status', PROFILE_STATUS.AVAILABLE] }, 1, 0]
            }
          },
          transferredCoaches: {
            $sum: {
              $cond: [{ $eq: ['$status', PROFILE_STATUS.TRANSFERRED] }, 1, 0]
            }
          },
          promotedCoaches: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isPromoted.status', true] },
                    { $gt: ['$isPromoted.endDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const categoryStats = await Coach.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const nationalityStats = await Coach.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$nationality',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        general: stats[0] || {
          totalCoaches: 0,
          availableCoaches: 0,
          transferredCoaches: 0,
          promotedCoaches: 0
        },
        byCategory: categoryStats,
        byNationality: nationalityStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coach statistics',
      error: error.message
    });
  }
};
