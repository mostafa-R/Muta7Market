import mongoose from 'mongoose';
import { PROFILE_STATUS, GENDER } from '../config/constants.js';

const coachSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true }
    },
    age: {
      type: Number,
      required: true,
      min: 25,
      max: 70
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: true
    },
    nationality: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'head_coach',
        'assistant_coach',
        'goalkeeper_coach',
        'fitness_coach',
        'technical_director'
      ]
    },
    experience: {
      years: { type: Number, default: 0 },
      clubs: [
        {
          name: String,
          position: String,
          from: Date,
          to: Date,
          achievements: [String]
        }
      ]
    },
    licenses: [
      {
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        documentUrl: String
      }
    ],
    monthlySalary: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'SAR' }
    },
    annualContract: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'SAR' }
    },
    contractEndDate: {
      type: Date
    },
    status: {
      type: String,
      enum: Object.values(PROFILE_STATUS),
      default: PROFILE_STATUS.AVAILABLE
    },
    transferredTo: {
      club: String,
      date: Date,
      amount: Number
    },
    media: {
      profileImage: {
        url: String,
        publicId: String
      },
      images: [
        {
          url: String,
          publicId: String,
          title: String,
          uploadedAt: { type: Date, default: Date.now }
        }
      ],
      videos: [
        {
          url: String,
          publicId: String,
          title: String,
          duration: Number,
          uploadedAt: { type: Date, default: Date.now }
        }
      ],
      documents: [
        {
          url: String,
          publicId: String,
          title: String,
          type: String,
          uploadedAt: { type: Date, default: Date.now }
        }
      ]
    },

    socialLinks: {
      instagram: String,
      twitter: String,
      whatsapp: String,
      linkedin: String
    },
    achievements: [
      {
        title: String,
        year: Number,
        description: String
      }
    ],
    isPromoted: {
      status: { type: Boolean, default: false },
      startDate: Date,
      endDate: Date,
      type: { type: String, enum: ['featured', 'premium'] }
    },
    contactInfo: {
      isHidden: { type: Boolean, default: true },
      email: String,
      phone: String,
      agent: {
        name: String,
        phone: String,
        email: String
      }
    },
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
    views: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
coachSchema.index({ 'name.en': 'text', 'name.ar': 'text' });
coachSchema.index({ nationality: 1, category: 1, status: 1 });
coachSchema.index({ 'isPromoted.status': 1, 'isPromoted.endDate': 1 });

// Virtual for checking if promoted
coachSchema.virtual('isCurrentlyPromoted').get(function () {
  return (
    this.isPromoted.status &&
    this.isPromoted.endDate &&
    this.isPromoted.endDate > new Date()
  );
});

// Method to promote coach
coachSchema.methods.promote = async function (days, type = 'featured') {
  this.isPromoted = {
    status: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    type
  };
  return this.save();
};

// Method to transfer coach
coachSchema.methods.transfer = async function (clubName, amount) {
  this.status = PROFILE_STATUS.TRANSFERRED;
  this.transferredTo = {
    club: clubName,
    date: new Date(),
    amount
  };
  return this.save();
};

export default mongoose.model('Coach', coachSchema);
