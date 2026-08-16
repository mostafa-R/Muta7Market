import { Notification } from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';
import { logger } from '../utils/logger.js';

const notificationI18n = {
  offer: { key: 'offer', titleEn: 'New offer', titleAr: 'عرض جديد' },
  interest: { key: 'interest', titleEn: 'New expression of interest', titleAr: 'إبداء اهتمام جديد' },
  message: { key: 'message', titleEn: 'New message', titleAr: 'رسالة جديدة' },
  negotiation: { key: 'negotiation', titleEn: 'Negotiation update', titleAr: 'تحديث في المفاوضات' },
  kyc: { key: 'kyc', titleEn: 'Verification update', titleAr: 'تحديث في التحقق' },
  subscription: { key: 'subscription', titleEn: 'Subscription update', titleAr: 'تحديث في الاشتراك' },
  trial: { key: 'trial', titleEn: 'Trial update', titleAr: 'تحديث في الاختبار' },
  rating: { key: 'rating', titleEn: 'New rating', titleAr: 'تقييم جديد' },
  contact: { key: 'contact', titleEn: 'New contact request', titleAr: 'طلب تواصل جديد' },
  system: { key: 'system', titleEn: 'System notification', titleAr: 'إشعار من النظام' },
};

export async function createNotification({ user, type, title, body, data = {}, lang = 'en' }) {
  if (!user) return null;
  try {
    const localizedTitle = title || notificationI18n[type]?.title || 'Notification';
    const notification = await Notification.create({
      user,
      type,
      title:
        typeof localizedTitle === 'object'
          ? localizedTitle
          : { en: localizedTitle, ar: localizedTitle },
      body: body
        ? typeof body === 'object'
          ? body
          : { en: body, ar: body }
        : { en: '', ar: '' },
      data,
    });

    const payload = {
      id: notification._id.toString(),
      type,
      title: { en: notification.title.en, ar: notification.title.ar },
      body: { en: notification.body.en, ar: notification.body.ar },
      data,
      createdAt: notification.createdAt,
    };
    emitToUser(user.toString(), 'notification:new', payload);
    return notification;
  } catch (err) {
    logger.error('Failed creating notification:', err.message);
    return null;
  }
}

export function localizeNotification(notification, lang) {
  return {
    id: notification._id?.toString(),
    type: notification.type,
    title: notification.title?.[lang] || notification.title?.en || '',
    body: notification.body?.[lang] || notification.body?.en || '',
    data: notification.data || {},
    read: !!notification.readAt,
    createdAt: notification.createdAt,
  };
}
