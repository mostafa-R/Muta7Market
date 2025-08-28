import { deleteFile } from '../config/cloudinary.js';
import { OFFER_STATUS, PRICING } from '../config/constants.js';
import Offer from '../models/offer.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildSortQuery, paginate } from '../utils/helpers.js';
import { sendInternalNotification } from './notification.controller.js';

// Helper function to update expired offers
const updateExpiredOffers = async () => {
  await Offer.updateMany(
    {
      expiryDate: { $lt: new Date() },
      status: OFFER_STATUS.ACTIVE
    },
    { status: OFFER_STATUS.EXPIRED }
  );
};

// Create Offer
export const createOffer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const requirePayment = req.user.role !== 'admin'; // Admin can create free offers

  if (requirePayment) {
    // Create payment for adding offer
    const payment = await paymentService.createPayment({
      user: userId,
      type: 'add_offer',
      amount: req.body.pricing?.addOfferCost || PRICING.ADD_OFFER,
      description: 'Payment for adding new offer'
    });

    // Create offer with pending payment status
    const offer = await Offer.create({
      user: userId,
      ...req.body,
      payment: {
        isPaid: false,
        paymentId: payment._id
      },
      status: OFFER_STATUS.PENDING
    });

    // Send notification about payment requirement
    await sendInternalNotification(
      userId,
      'Payment Required',
      'Please complete payment to activate your offer',
      { offerId: offer._id, paymentId: payment._id }
    );

    // Return payment URL for user to complete payment
    const paymentUrl = await paymentService.initiatePayment(payment._id);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { offer, paymentUrl },
          'Please complete payment to activate your offer'
        )
      );
  } else {
    // Direct creation without payment (for admin or free offers)
    const offer = await Offer.create({
      user: userId,
      ...req.body,
      payment: {
        isPaid: true,
        paidAt: new Date()
      },
      status: OFFER_STATUS.ACTIVE
    });

    // Send notification about successful creation
    await sendInternalNotification(
      userId,
      'Offer Created Successfully',
      `Your offer "${
        offer.title?.en || offer.title
      }" has been created and is now live!`,
      { offerId: offer._id }
    );

    res
      .status(201)
      .json(new ApiResponse(201, offer, 'Offer created successfully'));
  }
});

// Get All Offers (with advanced filtering)
export const getAllOffers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    search,
    category,
    status,
    isPromoted,
    nationality,
    minSalary,
    maxSalary,
    location
  } = req.query;

  // Build query
  const query = {
    isActive: true,
    'payment.isPaid': true // Only show paid offers
  };

  // Search functionality
  if (search) {
    query.$or = [
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'title.ar': { $regex: search, $options: 'i' } },
      { 'description.en': { $regex: search, $options: 'i' } },
      { 'description.ar': { $regex: search, $options: 'i' } }
    ];
  }

  // Category and status filters
  if (category) {
    query.category = category;
  }
  if (status) {
    query.status = status;
  }
  if (nationality) {
    query['targetProfile.nationality'] = nationality;
  }
  if (location) {
    query['offerDetails.location'] = { $regex: location, $options: 'i' };
  }

  // Salary range filter
  if (minSalary || maxSalary) {
    if (minSalary) {
      query['targetProfile.salaryRange.min'] = { $gte: minSalary };
    }
    if (maxSalary) {
      query['targetProfile.salaryRange.max'] = { $lte: maxSalary };
    }
  }

  // Promotion filter
  if (isPromoted !== undefined) {
    if (isPromoted === 'true') {
      query['promotion.isPromoted'] = true;
      query['promotion.endDate'] = { $gt: new Date() };
    } else {
      query.$or = [
        { 'promotion.isPromoted': false },
        { 'promotion.endDate': { $lte: new Date() } }
      ];
    }
  }

  // Update expired offers
  await updateExpiredOffers();

  // Pagination
  const { skip } = paginate(page, limit);
  let sort = buildSortQuery(sortBy);

  // Default sort: Promoted offers come first
  if (!sortBy) {
    sort = {
      'promotion.position': 1,
      'promotion.startDate': -1,
      createdAt: -1
    };
  }

  // Execute query
  const [offers, total] = await Promise.all([
    Offer.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email')
      .select('-unlockedBy') // Don't send unlocked users list in public view
      .lean(),
    Offer.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      },
      'Offers fetched successfully'
    )
  );
});

// Get Single Offer by ID
export const getOfferById = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user?._id;

  const offer = await Offer.findById(offerId).populate('user', 'name email');

  if (
    !offer ||
    (!offer.isActive && (!userId || offer.user.toString() !== userId))
  ) {
    throw new ApiError(404, 'Offer not found');
  }

  // Increment views (only for public access)
  if (!userId || userId.toString() !== offer.user.toString()) {
    offer.statistics.views += 1;
    await offer.save();
  }

  // Check if user has unlocked contact
  const hasUnlockedContact =
    userId && offer.hasUserUnlockedContact
      ? offer.hasUserUnlockedContact(userId)
      : false;

  // Hide contact info if not unlocked
  const offerData = offer.toObject();
  if (
    !hasUnlockedContact &&
    offer.contactInfo?.isHidden &&
    (!userId || userId.toString() !== offer.user.toString())
  ) {
    offerData.contactInfo = {
      isHidden: true,
      unlockCost: offer.pricing?.unlockContactCost || PRICING.UNLOCK_CONTACT
    };
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { offer: offerData, hasUnlockedContact },
        'Offer fetched successfully'
      )
    );
});

// Update Offer
export const updateOffer = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  const offer = await Offer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, 'Offer not found');
  }

  // Check permissions
  if (userRole !== 'admin' && offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only update your own offers');
  }

  // Don't allow updating if not paid (unless admin)
  if (!offer.payment.isPaid && userRole !== 'admin') {
    throw new ApiError(400, 'Please complete payment before updating offer');
  }

  // Update offer
  Object.assign(offer, req.body);
  offer.updatedAt = new Date();
  await offer.save();

  // Send notification about update
  await sendInternalNotification(
    offer.user,
    'Offer Updated',
    `Your offer "${
      offer.title?.en || offer.title
    }" has been updated successfully`,
    { offerId: offer._id }
  );

  res
    .status(200)
    .json(new ApiResponse(200, offer, 'Offer updated successfully'));
});

// Delete Offer
export const deleteOffer = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  const offer = await Offer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, 'Offer not found');
  }

  // Check permissions
  if (userRole !== 'admin' && offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only delete your own offers');
  }

  // Delete media files
  if (offer.media?.images) {
    for (const image of offer.media.images) {
      if (image.publicId) {
        await deleteFile(image.publicId);
      }
    }
  }

  if (offer.media?.documents) {
    for (const doc of offer.media.documents) {
      if (doc.publicId) {
        await deleteFile(doc.publicId);
      }
    }
  }

  // Soft delete
  offer.isActive = false;
  offer.status = OFFER_STATUS.INACTIVE;
  await offer.save();

  // Send notification about deletion
  await sendInternalNotification(
    offer.user,
    'Offer Deleted',
    `Your offer "${offer.title?.en || offer.title}" has been deleted`,
    { offerId: offer._id }
  );

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Offer deleted successfully'));
});

// Get My Offers
export const getMyOffers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { includeInactive = false, page = 1, limit = 10 } = req.query;

  const query = { user: userId };
  if (!includeInactive || includeInactive === 'false') {
    query.isActive = true;
  }

  const { skip } = paginate(page, limit);

  const [offers, total] = await Promise.all([
    Offer.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('unlockedBy.user', 'name email'),
    Offer.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      },
      'Your offers fetched successfully'
    )
  );
});

// Promote Offer
export const promoteOffer = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;
  const { days, type = 'featured' } = req.body;

  if (!days || days < 1) {
    throw new ApiError(
      400,
      'Please specify valid number of days for promotion'
    );
  }

  const offer = await Offer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, 'Offer not found');
  }

  // Check ownership
  if (offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only promote your own offers');
  }

  if (!offer.payment.isPaid) {
    throw new ApiError(400, 'Please complete initial payment before promoting');
  }

  if (offer.isCurrentlyPromoted) {
    throw new ApiError(400, 'Offer is already promoted');
  }

  // Calculate promotion cost
  const promotionCost =
    days *
    (offer.pricing?.promotionCost?.perDay || PRICING.PROMOTE_OFFER_PER_DAY);

  // Create payment for promotion
  const payment = await paymentService.createPayment({
    user: userId,
    type: 'promote_offer',
    amount: promotionCost,
    relatedOffer: offerId,
    description: `Promote offer for ${days} days as ${type}`,
    metadata: { promotionType: type, days }
  });

  // Return payment URL
  const paymentUrl = await paymentService.initiatePayment(payment._id);

  // Send notification about promotion payment
  await sendInternalNotification(
    userId,
    'Promotion Payment Required',
    `Complete payment to promote your offer for ${days} days`,
    { offerId: offer._id, paymentId: payment._id, promotionCost }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { paymentUrl, promotionCost },
        'Please complete payment to promote your offer'
      )
    );
});

// Unlock Contact Information
export const unlockContact = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;

  const offer = await Offer.findById(offerId);

  if (!offer) {
    throw new ApiError(404, 'Offer not found');
  }

  // Check if user is the owner
  if (offer.user.toString() === userId.toString()) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { contactInfo: offer.contactInfo },
          'You own this offer'
        )
      );
    return;
  }

  // Check if already unlocked
  if (offer.hasUserUnlockedContact && offer.hasUserUnlockedContact(userId)) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { contactInfo: offer.contactInfo },
          'Contact already unlocked'
        )
      );
    return;
  }

  // Create payment for unlocking contact
  const unlockCost = offer.pricing?.unlockContactCost || PRICING.UNLOCK_CONTACT;
  const payment = await paymentService.createPayment({
    user: userId,
    type: 'unlock_contact',
    amount: unlockCost,
    relatedOffer: offerId,
    description: `Unlock contact for offer: ${offer.title?.en || offer.title}`
  });

  // Return payment URL
  const paymentUrl = await paymentService.initiatePayment(payment._id);

  // Send notification about unlock payment
  await sendInternalNotification(
    userId,
    'Contact Unlock Payment',
    'Complete payment to unlock contact information for this offer',
    { offerId: offer._id, paymentId: payment._id, unlockCost }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { paymentUrl, unlockCost },
        'Please complete payment to unlock contact information'
      )
    );
});

// Get Offer Statistics (for offer owners)
export const getOfferStatistics = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;

  const offer = await Offer.findById(offerId).populate(
    'unlockedBy.user',
    'name email phone'
  );

  if (!offer) {
    throw new ApiError(404, 'Offer not found');
  }

  // Check ownership
  if (offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only view statistics for your own offers');
  }

  const unlockCost = offer.pricing?.unlockContactCost || PRICING.UNLOCK_CONTACT;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        statistics: offer.statistics,
        unlockedBy: offer.unlockedBy || [],
        totalRevenue: (offer.unlockedBy?.length || 0) * unlockCost
      },
      'Offer statistics fetched successfully'
    )
  );
});

// Handle Payment Success (Webhook handler)
export const handlePaymentSuccess = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  const payment = await Payment.findById(paymentId).populate('relatedOffer');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  switch (payment.type) {
  case 'add_offer':
  case 'promote_offer':
  case 'unlock_contact': {
    await paymentService.handlePaymentSuccess(payment._id);
    break;
  }
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Payment processed successfully'));
});

// Search Offers (Advanced search with filters)
export const searchOffers = asyncHandler(async (req, res) => {
  const {
    q: search,
    category,
    location,
    minSalary,
    maxSalary,
    nationality,
    page = 1,
    limit = 10,
    sortBy = 'relevance'
  } = req.query;

  if (!search) {
    throw new ApiError(400, 'Search query is required');
  }

  // Build search query
  const query = {
    isActive: true,
    'payment.isPaid': true,
    $or: [
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'title.ar': { $regex: search, $options: 'i' } },
      { 'description.en': { $regex: search, $options: 'i' } },
      { 'description.ar': { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
      { keywords: { $in: [new RegExp(search, 'i')] } }
    ]
  };

  // Apply additional filters
  if (category) {
    query.category = category;
  }
  if (location) {
    query['offerDetails.location'] = { $regex: location, $options: 'i' };
  }
  if (nationality) {
    query['targetProfile.nationality'] = nationality;
  }

  if (minSalary || maxSalary) {
    if (minSalary) {
      query['targetProfile.salaryRange.min'] = { $gte: parseInt(minSalary) };
    }
    if (maxSalary) {
      query['targetProfile.salaryRange.max'] = { $lte: parseInt(maxSalary) };
    }
  }

  // Pagination
  const { skip } = paginate(page, limit);

  // Sort options
  let sort = { score: { $meta: 'textScore' } };
  if (sortBy === 'date') {
    sort = { createdAt: -1 };
  }
  if (sortBy === 'salary') {
    sort = { 'targetProfile.salaryRange.max': -1 };
  }
  if (sortBy === 'popularity') {
    sort = { 'statistics.views': -1 };
  }

  // Execute search
  const [offers, total] = await Promise.all([
    Offer.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email')
      .select('-unlockedBy')
      .lean(),
    Offer.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        searchQuery: search,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      },
      `Found ${total} offers matching your search`
    )
  );
});

// Get Featured/Promoted Offers
export const getFeaturedOffers = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const query = {
    isActive: true,
    'payment.isPaid': true,
    'promotion.isPromoted': true,
    'promotion.endDate': { $gt: new Date() }
  };

  const offers = await Offer.find(query)
    .sort({ 'promotion.position': 1, 'promotion.startDate': -1 })
    .limit(parseInt(limit))
    .populate('user', 'name email')
    .select('-unlockedBy')
    .lean();

  res
    .status(200)
    .json(new ApiResponse(200, offers, 'Featured offers fetched successfully'));
});

// Get Similar Offers
export const getSimilarOffers = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const { limit = 5 } = req.query;

  const currentOffer = await Offer.findById(offerId);
  if (!currentOffer) {
    throw new ApiError(404, 'Offer not found');
  }

  const query = {
    _id: { $ne: offerId },
    isActive: true,
    'payment.isPaid': true,
    $or: [
      { category: currentOffer.category },
      { skills: { $in: currentOffer.skills || [] } },
      { 'offerDetails.location': currentOffer.offerDetails?.location }
    ]
  };

  const similarOffers = await Offer.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('user', 'name email')
    .select('-unlockedBy')
    .lean();

  res
    .status(200)
    .json(
      new ApiResponse(200, similarOffers, 'Similar offers fetched successfully')
    );
});
