import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Sport } from '../models/Sport.js';
import { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import { Setting } from '../models/Setting.js';
import { logger } from '../utils/logger.js';

const sports = [
  {
    code: 'football',
    name: { en: 'Football', ar: 'كرة القدم' },
    positions: [
      { code: 'gk', name: { en: 'Goalkeeper', ar: 'حارس مرمى' } },
      { code: 'rb', name: { en: 'Right Back', ar: 'ظهير أيمن' } },
      { code: 'lb', name: { en: 'Left Back', ar: 'ظهير أيسر' } },
      { code: 'cb', name: { en: 'Center Back', ar: 'مدافع محوري' } },
      { code: 'rwb', name: { en: 'Right Wing Back', ar: 'ظهير أيمن متقدم' } },
      { code: 'lwb', name: { en: 'Left Wing Back', ar: 'ظهير أيسر متقدم' } },
      { code: 'cdm', name: { en: 'Defensive Midfielder', ar: 'وسط مدافع' } },
      { code: 'cm', name: { en: 'Central Midfielder', ar: 'وسط ميدان' } },
      { code: 'cam', name: { en: 'Attacking Midfielder', ar: 'وسط هجومي' } },
      { code: 'rm', name: { en: 'Right Midfielder', ar: 'وسط يمين' } },
      { code: 'lm', name: { en: 'Left Midfielder', ar: 'وسط يسار' } },
      { code: 'rw', name: { en: 'Right Winger', ar: 'جناح أيمن' } },
      { code: 'lw', name: { en: 'Left Winger', ar: 'جناح أيسر' } },
      { code: 'st', name: { en: 'Striker', ar: 'مهاجم صريح' } },
      { code: 'cf', name: { en: 'Center Forward', ar: 'مهاجم ثانٍ' } },
      { code: 'ss', name: { en: 'Second Striker', ar: 'صانع ألعاب متقدم' } },
    ],
  },
  {
    code: 'basketball',
    name: { en: 'Basketball', ar: 'كرة السلة' },
    positions: [
      { code: 'pg', name: { en: 'Point Guard', ar: 'حارس نقطة' } },
      { code: 'sg', name: { en: 'Shooting Guard', ar: 'حارس مسدد' } },
      { code: 'sf', name: { en: 'Small Forward', ar: 'مهاجم صغير' } },
      { code: 'pf', name: { en: 'Power Forward', ar: 'مهاجم قوي' } },
      { code: 'c', name: { en: 'Center', ar: 'لاعب محور' } },
    ],
  },
  {
    code: 'handball',
    name: { en: 'Handball', ar: 'كرة اليد' },
    positions: [
      { code: 'gk', name: { en: 'Goalkeeper', ar: 'حارس مرمى' } },
      { code: 'lw', name: { en: 'Left Wing', ar: 'جناح أيسر' } },
      { code: 'rw', name: { en: 'Right Wing', ar: 'جناح أيمن' } },
      { code: 'lb', name: { en: 'Left Back', ar: 'ظهير أيسر' } },
      { code: 'rb', name: { en: 'Right Back', ar: 'ظهير أيمن' } },
      { code: 'cb', name: { en: 'Center Back', ar: 'صانع لعب' } },
      { code: 'p', name: { en: 'Pivot', ar: 'محور' } },
    ],
  },
  {
    code: 'volleyball',
    name: { en: 'Volleyball', ar: 'الكرة الطائرة' },
    positions: [
      { code: 'setter', name: { en: 'Setter', ar: 'معد' } },
      { code: 'opposite', name: { en: 'Opposite Hitter', ar: 'ضارب معاكس' } },
      { code: 'outside', name: { en: 'Outside Hitter', ar: 'ضارب خارجي' } },
      { code: 'middle', name: { en: 'Middle Blocker', ar: 'حاجز وسط' } },
      { code: 'libero', name: { en: 'Libero', ar: 'ليبرو' } },
    ],
  },
  {
    code: 'futsal',
    name: { en: 'Futsal', ar: 'كرة الصالات' },
    positions: [
      { code: 'gk', name: { en: 'Goalkeeper', ar: 'حارس مرمى' } },
      { code: 'fixo', name: { en: 'Defender', ar: 'مدافع' } },
      { code: 'ala', name: { en: 'Winger', ar: 'جناح' } },
      { code: 'pivot', name: { en: 'Pivot', ar: 'محور' } },
    ],
  },
];

const plans = [
  {
    code: 'player_free',
    name: { en: 'Player Free', ar: 'لاعب مجاني' },
    description: { en: 'Create your profile and upload 1 highlight video', ar: 'أنشئ ملفك وارفع مقطع فيديو واحد' },
    targetRole: 'player',
    priceMonthly: 0,
    priceYearly: 0,
    features: ['profile', 'one_video'],
    isActive: true,
  },
  {
    code: 'player_pro',
    name: { en: 'Player Pro', ar: 'لاعب برو' },
    description: { en: 'Unlimited videos and featured visibility in scout searches', ar: 'فيديوهات غير محدودة وظهور مميز في نتائج بحث الكشافين' },
    targetRole: 'player',
    priceMonthly: 9.99,
    priceYearly: 99,
    features: ['profile', 'unlimited_videos', 'featured_search'],
    isActive: true,
  },
  {
    code: 'club_scout',
    name: { en: 'Club Scout', ar: 'كشاف النادي' },
    description: { en: 'Advanced scouting engine, contact players and send offers', ar: 'محرك كشف متقدم، تواصل مع اللاعبين وإرسال العروض' },
    targetRole: 'club',
    priceMonthly: 49,
    priceYearly: 490,
    features: ['advanced_search', 'contact_players', 'send_offers', 'shortlists'],
    isActive: true,
  },
  {
    code: 'agent_pro',
    name: { en: 'Agent Pro', ar: 'وكيل برو' },
    description: { en: 'Manage multiple clients, advanced scouting and offers', ar: 'إدارة عدة لاعبين، كشف متقدم وعروض' },
    targetRole: 'agent',
    priceMonthly: 79,
    priceYearly: 790,
    features: ['multi_clients', 'advanced_search', 'send_offers', 'shortlists'],
    isActive: true,
  },
];

const defaultSettings = [
  { key: 'platform.name', value: 'Muta7 Market', type: 'string', group: 'platform', label: { en: 'Platform name', ar: 'اسم المنصة' }, isPublic: true },
  { key: 'platform.tagline', value: 'The sports transfer & recruitment marketplace', type: 'string', group: 'platform', label: { en: 'Tagline', ar: 'الشعار النصي' }, isPublic: true },
  { key: 'platform.logo', value: '', type: 'string', group: 'platform', label: { en: 'Logo URL', ar: 'رابط الشعار' }, isPublic: true },
  { key: 'platform.contactemail', value: 'support@muta7market.com', type: 'string', group: 'platform', label: { en: 'Support email', ar: 'بريد الدعم' }, isPublic: true },
  { key: 'platform.phone', value: '', type: 'string', group: 'platform', label: { en: 'Support phone', ar: 'هاتف الدعم' }, isPublic: true },
  { key: 'platform.defaultcurrency', value: 'USD', type: 'string', group: 'platform', label: { en: 'Default currency', ar: 'العملة الافتراضية' }, isPublic: true },
  { key: 'platform.maintenance', value: false, type: 'boolean', group: 'platform', label: { en: 'Maintenance mode', ar: 'وضع الصيانة' }, isPublic: true },
  { key: 'media.freevideolimit', value: 1, type: 'number', group: 'media', label: { en: 'Free players video limit', ar: 'حد فيديوهات اللاعب المجاني' }, isPublic: true },
  { key: 'media.videocategories', value: ['goals', 'defending', 'saves', 'skills', 'passing', 'speed', 'other'], type: 'array', group: 'media', label: { en: 'Video categories', ar: 'تصنيفات الفيديوهات' }, isPublic: true },
  { key: 'upload.imagemaxmb', value: 5, type: 'number', group: 'upload', label: { en: 'Max image size (MB)', ar: 'الحجم الأقصى للصور (ميجا)' } },
  { key: 'upload.videomaxmb', value: 200, type: 'number', group: 'upload', label: { en: 'Max video size (MB)', ar: 'الحجم الأقصى للفيديو (ميجا)' } },
  { key: 'upload.documentmaxmb', value: 10, type: 'number', group: 'upload', label: { en: 'Max document size (MB)', ar: 'الحجم الأقصى للمستندات (ميجا)' } },
  { key: 'offers.defaultexpirydays', value: 14, type: 'number', group: 'offers', label: { en: 'Offer default expiry (days)', ar: 'انتهاء صلاحية العرض الافتراضي (أيام)' } },
  { key: 'offers.autoexpire', value: true, type: 'boolean', group: 'offers', label: { en: 'Auto-expire offers', ar: 'إنهاء العروض تلقائياً' } },
  { key: 'negotiations.autoclosedays', value: 30, type: 'number', group: 'negotiations', label: { en: 'Auto-close negotiations (days)', ar: 'إغلاق المفاوضات تلقائياً (أيام)' } },
  { key: 'trials.defaultdurationminutes', value: 90, type: 'number', group: 'trials', label: { en: 'Default trial duration (min)', ar: 'مدة التجربة الافتراضية (دقائق)' } },
  { key: 'kyc.documentmaxcount', value: 5, type: 'number', group: 'kyc', label: { en: 'Max KYC documents', ar: 'الحد الأقصى لمستندات التحقق' } },
  { key: 'pagination.defaultlimit', value: 20, type: 'number', group: 'pagination', label: { en: 'Default page size', ar: 'حجم الصفحة الافتراضي' } },
  { key: 'pagination.maxlimit', value: 100, type: 'number', group: 'pagination', label: { en: 'Max page size', ar: 'الحجم الأقصى للصفحة' } },
  { key: 'ads.googleadsenseenabled', value: false, type: 'boolean', group: 'ads', label: { en: 'Google AdSense enabled', ar: 'تفعيل إعلانات Google' }, isPublic: true },
  { key: 'ads.googleadsenseclientid', value: '', type: 'string', group: 'ads', label: { en: 'AdSense publisher ID (ca-pub-...)', ar: 'معرف الناشر (ca-pub-...)' }, isPublic: true },
  { key: 'ads.googleadsensescript', value: '', type: 'string', group: 'ads', label: { en: 'AdSense script HTML', ar: 'كود AdSense' }, isPublic: true },
  { key: 'ads.googleadsenseformat', value: 'auto', type: 'string', group: 'ads', label: { en: 'Default ad format', ar: 'صيغة الإعلان الافتراضية' }, isPublic: true },
  { key: 'ads.maxperplacement', value: 4, type: 'number', group: 'ads', label: { en: 'Max ads per placement', ar: 'الحد الأقصى للإعلانات لكل موضع' }, isPublic: true },
];

async function seedAdmin() {
  const email = config.admin.email.toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) {
    logger.info(`Admin already exists: ${email}`);
    return;
  }
  await User.create({
    email,
    password: config.admin.password,
    displayName: config.admin.name,
    role: 'admin',
    isEmailVerified: true,
    termsAcceptedAt: new Date(),
  });
  logger.info(`Admin created: ${email}`);
}

async function seedSports() {
  let created = 0;
  for (const sport of sports) {
    const exists = await Sport.findOne({ code: sport.code });
    if (exists) continue;
    await Sport.create(sport);
    created++;
  }
  logger.info(`Sports seeded: ${created} created`);
}

async function seedPlans() {
  let created = 0;
  for (const plan of plans) {
    const exists = await SubscriptionPlan.findOne({ code: plan.code });
    if (exists) continue;
    await SubscriptionPlan.create(plan);
    created++;
  }
  logger.info(`Plans seeded: ${created} created`);
}

async function seedSettings() {
  let created = 0;
  for (const setting of defaultSettings) {
    const exists = await Setting.exists({ key: setting.key });
    if (exists) continue;
    await Setting.create(setting);
    created++;
  }
  logger.info(`Settings seeded: ${created} created`);
}

async function main() {
  const fresh = process.argv.includes('--fresh');
  if (fresh) {
    logger.warn('Fresh mode: dropping collections...');
    await Promise.all([
      Sport.deleteMany({}),
      SubscriptionPlan.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    await User.deleteOne({ email: config.admin.email.toLowerCase() });
  }

  await seedSports();
  await seedPlans();
  await seedSettings();
  await seedAdmin();
  logger.info('Seed completed ✅');
}

mongoose
  .connect(config.mongodbUri)
  .then(async () => {
    logger.info('Connected to MongoDB');
    await main();
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    logger.error('Seed failed:', err);
    process.exit(1);
  });