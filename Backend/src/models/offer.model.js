import mongoose from 'mongoose';
import { OFFER_STATUS } from '../config/constants.js';
import { getDefaultPricing } from '../utils/pricingUtils.js';

const offerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  category: {
    type: String,
    required: true,
    enum: ['player_wanted', 'coach_wanted', 'player_available', 'coach_available', 'other']
  },
  targetProfile: {
    type: { type: String, enum: ['player', 'coach'] },
    positions: [String],
    nationality: String,
    ageRange: {
      min: Number,
      max: Number
    },
    experienceYears: {
      min: Number,
      max: Number
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'SAR' }
    }
  },
  offerDetails: {
    club: String,
    location: String,
    contractDuration: Number, // in months
    benefits: [String],
    requirements: [String]
  },
  media: {
    images: [{
      url: String,
      publicId: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    documents: [{
      url: String,
      publicId: String,
      title: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  contactInfo: {
    isHidden: { type: Boolean, default: true },
    name: String,
    email: String,
    phone: String,
    whatsapp: String,
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'whatsapp'],
      default: 'email'
    }
  },
  pricing: {
    addOfferCost: {
      type: Number,
      default: () => getDefaultPricing().ADD_OFFER
    },
    promotionCost: {
      perDay: {
        type: Number,
        default: () => getDefaultPricing().PROMOTE_OFFER_PER_DAY
      },
      total: Number
    },
    unlockContactCost: {
      type: Number,
      default: () => getDefaultPricing().UNLOCK_CONTACT
    }
  },
  payment: {
    isPaid: { type: Boolean, default: false },
    paymentId: String,
    paidAmount: Number,
    paidAt: Date,
    paymentMethod: String
  },
  promotion: {
    isPromoted: { type: Boolean, default: false },
    promotionType: { type: String, enum: ['featured', 'premium', 'urgent'] },
    startDate: Date,
    endDate: Date,
    position: { type: Number, default: 0 } // for ordering promoted offers
  },
  status: {
    type: String,
    enum: Object.values(OFFER_STATUS),
    default: OFFER_STATUS.ACTIVE
  },
  expiryDate: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  },
  statistics: {
    views: { type: Number, default: 0 },
    contactUnlocks: { type: Number, default: 0 },
    applications: { type: Number, default: 0 }
  },
  unlockedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unlockedAt: { type: Date, default: Date.now },
    paymentId: String
  }],
  seo: {
    metaTitle: {
      en: String,
      ar: String
    },
    metaDescription: {
      en: String,
      ar: String
    },
    keywords: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
offerSchema.index({ 'title.en': 'text', 'title.ar': 'text', 'description.en': 'text', 'description.ar': 'text' });
offerSchema.index({ category: 1, status: 1 });
offerSchema.index({ 'promotion.isPromoted': 1, 'promotion.endDate': 1 });
offerSchema.index({ expiryDate: 1 });

// Virtual for checking if currently promoted
offerSchema.virtual('isCurrentlyPromoted').get(function() {
  return this.promotion.isPromoted &&
         this.promotion.endDate &&
         this.promotion.endDate > new Date();
});

// Virtual for checking if expired
offerSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Method to promote offer
offerSchema.methods.promote = async function(days, type = 'featured') {
  const totalCost = days * this.pricing.promotionCost.perDay;

  this.promotion = {
    isPromoted: true,
    promotionType: type,
    startDate: new Date(),
    endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    position: type === 'premium' ? 1 : type === 'featured' ? 2 : 3
  };

  this.pricing.promotionCost.total = totalCost;

  return this.save();
};

// Method to check if user has unlocked contact
offerSchema.methods.hasUserUnlockedContact = function(userId) {
  return this.unlockedBy.some(unlock =>
    unlock.user.toString() === userId.toString()
  );
};

// Method to unlock contact for user
offerSchema.methods.unlockContact = async function(userId, paymentId) {
  if (!this.hasUserUnlockedContact(userId)) {
    this.unlockedBy.push({
      user: userId,
      paymentId
    });
    this.statistics.contactUnlocks += 1;
    await this.save();
  }
};

// Auto-expire offers
offerSchema.pre('save', function(next) {
  if (this.expiryDate < new Date() && this.status === OFFER_STATUS.ACTIVE) {
    this.status = OFFER_STATUS.EXPIRED;
  }
  next();
});

export default mongoose.model('Offer', offerSchema);
