import { Router } from 'express';
import Joi from 'joi';
import { protect, isAdmin } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.middleware.js';
import { planAdminSchema, advertisementSchema } from '../validators/monetization.validator.js';
import {
  adminQuerySchema,
  adminBanSchema,
  idParamSchema,
} from '../validators/misc.validator.js';
import {
  adminCreatePlayerSchema,
  adminCreateCoachSchema,
  adminCreateClubSchema,
  adminCreateAgentSchema,
  adminUpdatePlayerSchema,
  adminUpdateCoachSchema,
  adminUpdateClubSchema,
  adminUpdateAgentSchema,
  adminVerifySchema,
  adminSportSchema,
  adminUpdateSportSchema,
  adminUserUpdateSchema,
  adminMediaQuerySchema,
} from '../validators/admin.validator.js';
import {
  settingCreateSchema,
  settingUpdateSchema,
  settingListQuerySchema,
  settingKeyParamSchema,
} from '../validators/settings.validator.js';
import { adminLimiter } from '../middleware/rateLimit.middleware.js';
import {
  getStats,
  listUsers,
  banUser,
  unbanUser,
  createPlan,
  updatePlan,
  deletePlan,
  listPlans,
  listSubscriptions,
  listAdvertisements,
  updateAdvertisementStatus,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  createSport,
  updateSport,
  deleteSport,
  listSports,
  updateUser,
  deleteUser,
  listMedia,
  deleteMedia,
} from '../controllers/admin.controller.js';
import {
  listEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  verifyEntity,
} from '../controllers/adminEntities.controller.js';
import {
  listAllSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  refreshSettingsCache,
} from '../controllers/settings.controller.js';
import { listAllInvoices } from '../controllers/payment.controller.js';

const router = Router();

const adAdminStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'active', 'paused', 'expired').required(),
});

router.use(adminLimiter, protect, isAdmin);

router.get('/stats', getStats);
router.get('/users', validate(adminQuerySchema), listUsers);
router.patch('/users/:id', validateParams(idParamSchema), validate(adminUserUpdateSchema), updateUser);
router.delete('/users/:id', validateParams(idParamSchema), deleteUser);
router.post('/users/:id/ban', validateParams(idParamSchema), validate(adminBanSchema), banUser);
router.post('/users/:id/unban', validateParams(idParamSchema), unbanUser);

router.get('/players', listEntity('player'));
router.post('/players', validate(adminCreatePlayerSchema), createEntity('player'));
router.patch('/players/:id', validateParams(idParamSchema), validate(adminUpdatePlayerSchema), updateEntity('player'));
router.delete('/players/:id', validateParams(idParamSchema), deleteEntity('player'));
router.post('/players/:id/verify', validateParams(idParamSchema), validate(adminVerifySchema), verifyEntity('player'));

router.get('/coaches', listEntity('coach'));
router.post('/coaches', validate(adminCreateCoachSchema), createEntity('coach'));
router.patch('/coaches/:id', validateParams(idParamSchema), validate(adminUpdateCoachSchema), updateEntity('coach'));
router.delete('/coaches/:id', validateParams(idParamSchema), deleteEntity('coach'));
router.post('/coaches/:id/verify', validateParams(idParamSchema), validate(adminVerifySchema), verifyEntity('coach'));

router.get('/clubs', listEntity('club'));
router.post('/clubs', validate(adminCreateClubSchema), createEntity('club'));
router.patch('/clubs/:id', validateParams(idParamSchema), validate(adminUpdateClubSchema), updateEntity('club'));
router.delete('/clubs/:id', validateParams(idParamSchema), deleteEntity('club'));
router.post('/clubs/:id/verify', validateParams(idParamSchema), validate(adminVerifySchema), verifyEntity('club'));

router.get('/agents', listEntity('agent'));
router.post('/agents', validate(adminCreateAgentSchema), createEntity('agent'));
router.patch('/agents/:id', validateParams(idParamSchema), validate(adminUpdateAgentSchema), updateEntity('agent'));
router.delete('/agents/:id', validateParams(idParamSchema), deleteEntity('agent'));
router.post('/agents/:id/verify', validateParams(idParamSchema), validate(adminVerifySchema), verifyEntity('agent'));

router.get('/sports', listSports);
router.post('/sports', validate(adminSportSchema), createSport);
router.patch('/sports/:id', validateParams(idParamSchema), validate(adminUpdateSportSchema), updateSport);
router.delete('/sports/:id', validateParams(idParamSchema), deleteSport);

router.get('/plans', listPlans);
router.post('/plans', validate(planAdminSchema), createPlan);
router.patch('/plans/:id', validateParams(idParamSchema), validate(planAdminSchema), updatePlan);
router.delete('/plans/:id', validateParams(idParamSchema), deletePlan);

router.get('/subscriptions', listSubscriptions);
router.get('/invoices', listAllInvoices);
router.get('/advertisements', listAdvertisements);
router.post('/advertisements', validate(advertisementSchema), createAdvertisement);
router.patch('/advertisements/:id', validateParams(idParamSchema), validate(advertisementSchema), updateAdvertisement);
router.patch('/advertisements/:id/status', validateParams(idParamSchema), validate(adAdminStatusSchema), updateAdvertisementStatus);
router.delete('/advertisements/:id', validateParams(idParamSchema), deleteAdvertisement);

router.get('/media', validate(adminMediaQuerySchema), listMedia);
router.delete('/media/:id', validateParams(idParamSchema), deleteMedia);

router.get('/settings', validate(settingListQuerySchema), listAllSettings);
router.post('/settings', validate(settingCreateSchema), createSetting);
router.patch('/settings/:key', validateParams(settingKeyParamSchema), validate(settingUpdateSchema), updateSetting);
router.delete('/settings/:key', validateParams(settingKeyParamSchema), deleteSetting);
router.post('/settings/refresh-cache', refreshSettingsCache);

export default router;