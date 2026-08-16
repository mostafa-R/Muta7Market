import { catchAsync } from '../utils/catchAsync.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { KycRequest } from '../models/KycRequest.js';
import { PlayerProfile } from '../models/PlayerProfile.js';
import { CoachProfile } from '../models/CoachProfile.js';
import { ClubProfile } from '../models/ClubProfile.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { ROLES, KYC_STATUS } from '../config/constants.js';
import { moveUploadedFile } from '../utils/fileUtils.js';
import { createNotification } from '../services/notification.service.js';
import { emitToUser } from '../config/socket.js';
import { getPagination, paginateMeta } from '../utils/pagination.js';

const PROFILE_MODELS = {
  [ROLES.PLAYER]: PlayerProfile,
  [ROLES.COACH]: CoachProfile,
  [ROLES.CLUB]: ClubProfile,
  [ROLES.AGENT]: AgentProfile,
};

function getProfileModel(role) {
  return PROFILE_MODELS[role] || null;
}

export const submitKyc = catchAsync(async (req, res) => {
  const ProfileModel = getProfileModel(req.user.role);
  if (!ProfileModel) throw new ApiError(403, 'common.forbidden', {}, req.t('common.forbidden'));

  const pending = await KycRequest.findOne({ user: req.userId, status: KYC_STATUS.PENDING });
  if (pending) throw new ApiError(409, 'kyc.alreadyPending', {}, req.t('kyc.alreadyPending'));

  const docTypes = Array.isArray(req.body.docTypes) ? req.body.docTypes : [];
  const files = req.files || [];
  const documents = [];

  for (let i = 0; i < Math.min(docTypes.length, files.length); i++) {
    const moved = moveUploadedFile({ file: files[i], tempFileRelative: `temp/${files[i].filename}` }, 'documents');
    documents.push({
      type: docTypes[i],
      filePath: moved.path,
      originalName: moved.originalName,
      mimeType: moved.mimeType,
    });
  }

  if (!documents.length) {
    throw new ApiError(400, 'validation.fieldRequired', { field: 'documents' }, req.t('validation.fieldRequired'));
  }

  const request = await KycRequest.create({
    user: req.userId,
    role: req.user.role,
    orgName: req.body.orgName || '',
    documents,
  });

  await ProfileModel.updateOne({ user: req.userId }, { kycStatus: KYC_STATUS.PENDING });

  res.status(201).json(new ApiResponse(201, req.t('kyc.submitted'), request));
});

export const getMyKyc = catchAsync(async (req, res) => {
  const requests = await KycRequest.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, req.t('kyc.fetched'), requests));
});

export const listAllKyc = catchAsync(async (req, res) => {
  const { page, limit, skip } = await getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) filter.role = req.query.role;

  const total = await KycRequest.countDocuments(filter);
  const data = await KycRequest.find(filter)
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'displayName email role')
    .lean();

  res.status(200).json(new ApiResponse(200, req.t('kyc.fetched'), data, paginateMeta(total, page, limit)));
});

export const reviewKyc = catchAsync(async (req, res) => {
  const request = await KycRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'kyc.notFound');

  const approved = req.body.action === 'approve';
  request.status = approved ? KYC_STATUS.APPROVED : KYC_STATUS.REJECTED;
  request.reviewedBy = req.userId;
  request.reviewedAt = new Date();
  request.reviewNote = req.body.note || '';
  await request.save();

  const ProfileModel = getProfileModel(request.role);
  if (ProfileModel) {
    await ProfileModel.updateOne({ user: request.user }, { kycStatus: request.status, isVerified: approved });
  }

  createNotification({
    user: request.user,
    type: 'kyc',
    title: approved
      ? { en: 'KYC approved — verified badge granted', ar: 'تمت الموافقة على التحقق — حصلت على علامة التوثيق' }
      : { en: 'KYC rejected', ar: 'تم رفض التحقق' },
    body: approved
      ? { en: 'Your profile is now verified', ar: 'ملفك الشخصي موثق الآن' }
      : { en: `Reason: ${request.reviewNote || 'Please resubmit valid documents'}`, ar: `السبب: ${request.reviewNote || 'يرجى إعادة إرسال مستندات صحيحة'}` },
    data: { kycId: request._id, status: request.status },
  }).catch(() => {});
  emitToUser(request.user.toString(), 'kyc:update', { id: request._id, status: request.status });

  res.status(200).json(
    new ApiResponse(200, approved ? req.t('kyc.approved') : req.t('kyc.rejected'), request)
  );
});