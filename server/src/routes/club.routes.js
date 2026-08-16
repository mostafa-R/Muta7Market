import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { clubProfileSchema, clubVacancySchema } from '../validators/profile.validator.js';
import { uploadImage, verifyMagicBytes } from '../middleware/upload.middleware.js';
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getPublicProfile,
  listPublic,
  addVacancy,
  updateVacancy,
  deleteVacancy,
  uploadLogo,
} from '../controllers/club.controller.js';

const router = Router();

router.post('/profile', protect, validate(clubProfileSchema), createProfile);
router.patch('/profile', protect, validate(clubProfileSchema), updateProfile);
router.get('/profile/me', protect, getMyProfile);
router.post('/profile/logo', protect, uploadImage('image'), verifyMagicBytes('image'), uploadLogo);

router.post('/vacancies', protect, validate(clubVacancySchema), addVacancy);
router.patch('/vacancies/:vacancyId', protect, validate(clubVacancySchema), updateVacancy);
router.delete('/vacancies/:vacancyId', protect, deleteVacancy);

router.get('/', optionalAuth, listPublic);
router.get('/:clubId', optionalAuth, getPublicProfile);

export default router;
