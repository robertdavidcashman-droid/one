/**
 * Canonical source of truth for contact information
 * All phone numbers, emails, and contact details should import from here
 */

export const CONTACT = {
  // Phone number - Display format (with spaces for readability)
  // Format: 0333 0497 036 (spaces after 0333 and 0497)
  phoneDisplay: '0333 0497 036',
  
  // Phone number - Tel link format (no spaces)
  phoneTel: 'tel:03330497036',
  
  // Phone number - Raw format (no spaces, no tel:)
  phoneRaw: '03330497036',
  
  // Phone number - International format for WhatsApp
  phoneInternational: '4475330497036',
  
  // WhatsApp link (full URL)
  whatsapp: 'https://wa.me/4475330497036',
  
  // SMS link
  sms: 'sms:07535494446',
  
  // Email
  email: 'robertcashman@defencelegalservices.co.uk',
  
  // Email mailto link
  emailLink: 'mailto:robertcashman@defencelegalservices.co.uk',
} as const;

// Export individual values for convenience
export const PHONE_DISPLAY = CONTACT.phoneDisplay;
export const PHONE_TEL = CONTACT.phoneTel;
export const PHONE_RAW = CONTACT.phoneRaw;
export const PHONE_INTERNATIONAL = CONTACT.phoneInternational;
export const WHATSAPP = CONTACT.whatsapp;
export const SMS = CONTACT.sms;
export const EMAIL = CONTACT.email;
export const EMAIL_LINK = CONTACT.emailLink;

