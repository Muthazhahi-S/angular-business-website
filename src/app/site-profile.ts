import { inject, InjectionToken } from '@angular/core';

export const BUSINESS_TYPES = [
  'salonBeauty',
  'restaurantCafe',
  'clinicHealthcare',
  'localRetail',
  'professionalServices',
  'portfolioPersonalBrand',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  salonBeauty: 'Salon / Beauty',
  restaurantCafe: 'Restaurant / Cafe',
  clinicHealthcare: 'Clinic / Healthcare',
  localRetail: 'Local Shop / Retail',
  professionalServices: 'Professional Services',
  portfolioPersonalBrand: 'Portfolio / Personal Brand',
};

export const WHATSAPP_CONFIG = {
  // Reserved fictional US 555-01xx number; replace with the client's WhatsApp number.
  whatsappNumber: '12025550147',
  whatsappMessage: 'Hello, I would like to ask about your services.',
  enableWhatsapp: true,
} as const;

export const DEMO_SETTINGS = {
  showReminders: false,
  whatsappReminder: 'Demo WhatsApp number — replace before launch.',
  footerReminder: 'Replace the sample contact details before publishing.',
} as const;

type BusinessService = {
  name: string;
  description: string;
  symbol: string;
};

export type WebsitePackage = {
  id: string;
  name: string;
  suitableFor: string;
  features: readonly string[];
  price: string | null;
};

export const WEBSITE_PACKAGES: readonly WebsitePackage[] = [
  {
    id: 'starter',
    name: 'Starter Website',
    suitableFor: 'Suitable for small and local businesses.',
    features: [
      '1–3 pages',
      'Mobile responsive',
      'Contact form',
      'Basic SEO-friendly structure',
    ],
    price: null,
  },
  {
    id: 'business',
    name: 'Business Website',
    suitableFor: 'Suitable for growing businesses.',
    features: [
      '4–7 pages',
      'Mobile responsive',
      'Contact form',
      'WhatsApp / contact CTA',
      'Basic SEO-friendly structure',
    ],
    price: null,
  },
  {
    id: 'custom',
    name: 'Custom Website',
    suitableFor: 'Suitable for businesses with specific requirements.',
    features: [
      'Custom page structure',
      'Advanced UI requirements',
      'Custom Angular functionality',
      'API integration when required',
    ],
    price: null,
  },
];

type ContentPoint = {
  title: string;
  description: string;
};

export type BusinessProfile = {
  name: string;
  brandMark: string;
  brandWordmark: { primary: string; accent: string };
  tagline: string;
  email: string;
  phone: string;
  phoneLink: string;
  whatsappNumber: string;
  whatsappMessage: string;
  enableWhatsapp: boolean;
  whatsappUrl: string;
  address: string;
  demoMode: boolean;
  showDemoReminders: boolean;
  whatsappDemoReminder: string;
  footerDemoReminder: string;
  pageTitle: string;
  pageDescription: string;
  navigation: { contactCta: string };
  packages: readonly WebsitePackage[];
  hero: {
    eyebrow: string;
    headingLead: string;
    headingSecondLine: string;
    headingEmphasis: string;
    subheading: string;
    contactCta: string;
    imageUrl: string;
    supportTitle: string;
    supportText: string;
    imageAlt: string;
    noteLead: string;
    noteEmphasis: string;
    imageCaption: string;
    highlights: [string, string, string];
  };
  services: {
    eyebrow: string;
    headingLead: string;
    headingEmphasis: string;
    intro: string;
    items: readonly BusinessService[];
    footerText: string;
    footerCta: string;
  };
  about: {
    eyebrow: string;
    headingLead: string;
    headingMiddle: string;
    headingEmphasis: string;
    intro: string;
    description: string;
    cta: string;
    badgeTitle: string;
    badgeText: string;
    imageUrl: string;
    imageAlt: string;
    valuesLabel: string;
    values: readonly ContentPoint[];
  };
  why: {
    eyebrow: string;
    headingLead: string;
    headingEmphasis: string;
    intro: string;
    cta: string;
    principles: readonly ContentPoint[];
  };
  process: {
    eyebrow: string;
    headingLead: string;
    headingEmphasis: string;
    intro: string;
    steps: readonly ContentPoint[];
    footerText: string;
    footerCta: string;
  };
  contact: {
    eyebrow: string;
    headingLead: string;
    headingEmphasis: string;
    intro: string;
    formLabel: string;
    formCta: string;
    demoReminder: string;
    servicePrompt: string;
    projectPrompt: string;
  };
};

const businessProfile = (
  name: string,
  brandMark: string,
  primary: string,
  accent: string,
  tagline: string,
  pageTitle: string,
  pageDescription: string,
  contactDetails: Pick<BusinessProfile, 'email' | 'phone' | 'phoneLink' | 'address'>,
  hero: BusinessProfile['hero'],
  services: BusinessProfile['services'],
  about: BusinessProfile['about'],
  why: BusinessProfile['why'],
  process: BusinessProfile['process'],
  contact: BusinessProfile['contact'],
): BusinessProfile => ({
  name,
  brandMark,
  brandWordmark: { primary, accent },
  tagline,
  ...contactDetails,
  ...WHATSAPP_CONFIG,
  whatsappUrl: `https://wa.me/${WHATSAPP_CONFIG.whatsappNumber}?text=${encodeURIComponent(WHATSAPP_CONFIG.whatsappMessage)}`,
  demoMode: true,
  showDemoReminders: DEMO_SETTINGS.showReminders,
  whatsappDemoReminder: DEMO_SETTINGS.whatsappReminder,
  footerDemoReminder: DEMO_SETTINGS.footerReminder,
  pageTitle,
  pageDescription,
  navigation: { contactCta: hero.contactCta },
  packages: WEBSITE_PACKAGES,
  hero,
  services,
  about,
  why,
  process,
  contact,
});

export const BUSINESS_PROFILES: Record<BusinessType, BusinessProfile> = {
  salonBeauty: businessProfile(
    'GreenLeaf Salon',
    'G',
    'GreenLeaf',
    'Salon',
    'Professional Hair & Beauty Care',
    'GreenLeaf Salon | Hair & Beauty Care',
    'Explore professional hair and beauty care at GreenLeaf Salon in Salem, Tamil Nadu.',
    { email: 'greenleaf@example.com', phone: '+91 98765 43210', phoneLink: '+919876543210', address: 'Salem, Tamil Nadu' },
    {
      eyebrow: 'Hair & beauty care in Salem',
      headingLead: 'Hair & beauty care',
      headingSecondLine: 'that feels like',
      headingEmphasis: 'you',
      subheading: 'Explore salon services and get in touch to ask about appointments, hair care, and beauty treatments.',
      contactCta: 'Enquire about an appointment',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1300&q=85',
      supportTitle: 'Care that fits your style.',
      supportText: 'Ask about services and appointment availability.',
      imageAlt: 'A calm, light-filled salon interior with styling stations',
      noteLead: 'A little time for',
      noteEmphasis: 'yourself.',
      imageCaption: 'A welcoming place for hair and beauty care.',
      highlights: ['Hair care', 'Beauty services', 'Appointment enquiries'],
    },
    {
      eyebrow: 'Salon services',
      headingLead: 'Care for your hair',
      headingEmphasis: 'and more.',
      intro: 'Explore the salon services available and contact the team to ask about the right appointment for you.',
      items: [
        { name: 'Haircuts & styling', description: 'Discuss a cut or style that suits your preferences and occasion.', symbol: '✂' },
        { name: 'Hair colouring', description: 'Ask about colour options, consultation, and appointment availability.', symbol: '◉' },
        { name: 'Hair treatments', description: 'Learn about care options for different hair needs and routines.', symbol: '✳' },
        { name: 'Blow-dry & finishing', description: 'Arrange styling and finishing for an everyday look or special event.', symbol: '↗' },
        { name: 'Beauty services', description: 'Enquire about available beauty treatments and booking times.', symbol: '⌘' },
        { name: 'Bridal & occasion styling', description: 'Talk through styling needs and timing for a special occasion.', symbol: '✧' },
      ],
      footerText: 'Have a question about a service or appointment?',
      footerCta: 'Contact the salon',
    },
    {
      eyebrow: 'About GreenLeaf Salon',
      headingLead: 'A welcoming space',
      headingMiddle: 'for your hair and',
      headingEmphasis: 'beauty care.',
      intro: 'GreenLeaf Salon offers professional hair and beauty care in Salem, Tamil Nadu.',
      description: 'Whether you are planning a routine visit or preparing for an occasion, get in touch to discuss available services and appointment details.',
      cta: 'Ask about an appointment',
      badgeTitle: 'Salem, Tamil Nadu',
      badgeText: 'Professional hair & beauty care',
      imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'A salon interior with styling stations and mirrors',
      valuesLabel: 'Salon information',
      values: [
        { title: 'Hair services', description: 'Ask about cuts, colour, and styling.' },
        { title: 'Beauty care', description: 'Enquire about available treatments.' },
        { title: 'Appointments', description: 'Contact the salon to discuss timing.' },
      ],
    },
    {
      eyebrow: 'Why visit GreenLeaf',
      headingLead: 'Your style, your',
      headingEmphasis: 'appointment.',
      intro: 'Get in touch with the salon to discuss your preferences, service options, and appointment availability.',
      cta: 'Enquire about a visit',
      principles: [
        { title: 'Talk through your preferences', description: 'Share what you have in mind before choosing a service.' },
        { title: 'Ask about available services', description: 'Get details about the salon’s hair and beauty care options.' },
        { title: 'Plan your visit', description: 'Contact the team to ask about scheduling and preparation.' },
        { title: 'Get in touch directly', description: 'Use the contact details to discuss your appointment.' },
      ],
    },
    {
      eyebrow: 'Your salon visit',
      headingLead: 'From enquiry',
      headingEmphasis: 'to appointment.',
      intro: 'A simple way to find out about salon services and discuss a visit.',
      steps: [
        { title: 'Get in touch', description: 'Tell the salon what service or appointment you are asking about.' },
        { title: 'Discuss your preferences', description: 'Talk through the service options and details for your visit.' },
        { title: 'Arrange a time', description: 'Contact the salon to ask about appointment availability.' },
      ],
      footerText: 'For appointments and service details, contact GreenLeaf Salon.',
      footerCta: 'Contact the salon',
    },
    {
      eyebrow: 'Contact GreenLeaf Salon',
      headingLead: 'Let’s talk',
      headingEmphasis: 'appointments.',
      intro: 'Send an enquiry about salon services or appointment availability in Salem.',
      formLabel: 'Contact GreenLeaf Salon',
      formCta: 'Send your enquiry',
      demoReminder: 'Demo contact details: update the email, phone, and location before publishing.',
      servicePrompt: 'Which salon service are you interested in?',
      projectPrompt: 'Share the service or appointment details you would like to discuss.',
    },
  ),
  restaurantCafe: businessProfile(
    'GreenLeaf Cafe',
    'G',
    'GreenLeaf',
    'Cafe',
    'A neighbourhood place to eat and unwind',
    'GreenLeaf Cafe | Restaurant & Cafe',
    'Explore the menu, dining details, and contact information for GreenLeaf Cafe in Salem, Tamil Nadu.',
    { email: 'hello@greenleafcafe.example', phone: '+91 90000 00027', phoneLink: '+919000000027', address: 'Salem, Tamil Nadu' },
    {
      eyebrow: 'A neighbourhood cafe in Salem',
      headingLead: 'Good food,',
      headingSecondLine: 'good company,',
      headingEmphasis: 'your way',
      subheading: 'Explore the menu, find practical dining information, and contact the cafe with questions or reservation enquiries.',
      contactCta: 'Ask about a table',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1300&q=85',
      supportTitle: 'Your next meal starts here.',
      supportText: 'Get in touch for menu and dining details.',
      imageAlt: 'A relaxed cafe table set for a meal',
      noteLead: 'Make room for',
      noteEmphasis: 'something good.',
      imageCaption: 'A place to slow down and enjoy a meal.',
      highlights: ['Menu', 'Dining details', 'Table enquiries'],
    },
    {
      eyebrow: 'Food & drink',
      headingLead: 'Find something',
      headingEmphasis: 'to enjoy.',
      intro: 'Find the menu, opening details, and contact information you need before visiting.',
      items: [
        { name: 'Breakfast & brunch', description: 'Share breakfast and brunch menu details and serving times.', symbol: '☼' },
        { name: 'Cafe favourites', description: 'Introduce dishes and drinks available at the cafe.', symbol: '⌂' },
        { name: 'Coffee & tea', description: 'List coffee, tea, and other drinks served throughout the day.', symbol: '☕' },
        { name: 'Lunch options', description: 'Help visitors explore lunch choices and dining information.', symbol: '◉' },
        { name: 'Takeaway enquiries', description: 'Explain how to ask about takeaway options and availability.', symbol: '↗' },
        { name: 'Group dining', description: 'Invite guests to contact the cafe about group visits.', symbol: '⌘' },
      ],
      footerText: 'For current menu and availability, contact the cafe.',
      footerCta: 'Ask the cafe',
    },
    {
      eyebrow: 'About GreenLeaf Cafe',
      headingLead: 'A local place',
      headingMiddle: 'to share a meal',
      headingEmphasis: 'and a moment.',
      intro: 'GreenLeaf Cafe is a neighbourhood restaurant and cafe in Salem, Tamil Nadu.',
      description: 'Use this space to share the cafe’s story, introduce its menu, and provide practical details that help guests plan a visit.',
      cta: 'Ask about dining',
      badgeTitle: 'Salem, Tamil Nadu',
      badgeText: 'Restaurant & cafe',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'A welcoming restaurant dining room prepared for guests',
      valuesLabel: 'Dining information',
      values: [
        { title: 'Menu', description: 'Explore food and drink options.' },
        { title: 'Visit', description: 'Check location and dining details.' },
        { title: 'Enquiries', description: 'Ask about tables and group visits.' },
      ],
    },
    {
      eyebrow: 'Why visit GreenLeaf',
      headingLead: 'Plan a visit',
      headingEmphasis: 'with ease.',
      intro: 'Find useful dining details and contact the cafe with questions before you visit.',
      cta: 'Ask about a visit',
      principles: [
        { title: 'See menu information', description: 'Explore the food and drink details shared by the cafe.' },
        { title: 'Find practical details', description: 'Check location and visit information in one place.' },
        { title: 'Ask before you arrive', description: 'Contact the team about menu or dining questions.' },
        { title: 'Discuss group visits', description: 'Get in touch to ask about arrangements for your party.' },
      ],
    },
    {
      eyebrow: 'Plan a visit',
      headingLead: 'From menu',
      headingEmphasis: 'to table.',
      intro: 'Find out about the cafe and get in touch if you need more details.',
      steps: [
        { title: 'Explore', description: 'Browse the menu and information about the cafe.' },
        { title: 'Get in touch', description: 'Ask about dishes, opening details, or group visits.' },
        { title: 'Plan your visit', description: 'Use the contact details to discuss your plans.' },
      ],
      footerText: 'Menu and dining details may change; contact the cafe to ask.',
      footerCta: 'Contact the cafe',
    },
    {
      eyebrow: 'Contact GreenLeaf Cafe',
      headingLead: 'Planning',
      headingEmphasis: 'a visit?',
      intro: 'Get in touch with menu questions, dining enquiries, or details about visiting the cafe.',
      formLabel: 'Contact GreenLeaf Cafe',
      formCta: 'Send your enquiry',
      demoReminder: 'Demo contact details: update the email, phone, and location before publishing.',
      servicePrompt: 'What would you like to ask about?',
      projectPrompt: 'Share your question or dining enquiry.',
    },
  ),
  clinicHealthcare: businessProfile(
    'GreenLeaf Health Clinic',
    'G',
    'GreenLeaf',
    'Clinic',
    'Clinic information and appointment enquiries',
    'GreenLeaf Health Clinic | Patient Information',
    'Find general clinic information and contact GreenLeaf Health Clinic in Salem, Tamil Nadu.',
    { email: 'care@greenleafclinic.example', phone: '+91 90000 00028', phoneLink: '+919000000028', address: 'Salem, Tamil Nadu' },
    {
      eyebrow: 'Healthcare information in Salem',
      headingLead: 'Care information,',
      headingSecondLine: 'made easier',
      headingEmphasis: 'to find',
      subheading: 'Find general clinic information, learn how to get in touch, and ask about appointment availability.',
      contactCta: 'Contact the clinic',
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1300&q=85',
      supportTitle: 'Clear information for your visit.',
      supportText: 'Contact the clinic for appointment details.',
      imageAlt: 'A calm, welcoming healthcare reception area',
      noteLead: 'Here to help you',
      noteEmphasis: 'get in touch.',
      imageCaption: 'Find clinic information and contact details.',
      highlights: ['Clinic information', 'Patient enquiries', 'Appointments'],
    },
    {
      eyebrow: 'Clinic information',
      headingLead: 'Information for',
      headingEmphasis: 'your visit.',
      intro: 'Use this section for general clinic details and ways to contact the care team.',
      items: [
        { name: 'General consultations', description: 'Contact the clinic to ask about consultation availability.', symbol: '＋' },
        { name: 'Preventive care', description: 'Ask the care team for information about preventive services.', symbol: '◉' },
        { name: 'Family health', description: 'Enquire about general services for different family needs.', symbol: '⌂' },
        { name: 'Follow-up visits', description: 'Get in touch with the clinic to discuss follow-up scheduling.', symbol: '↗' },
        { name: 'Patient information', description: 'Ask the clinic what information to bring for your visit.', symbol: '▤' },
        { name: 'Appointment enquiries', description: 'Contact the clinic directly to ask about available times.', symbol: '⌘' },
      ],
      footerText: 'For medical advice, contact a qualified healthcare professional.',
      footerCta: 'Contact the clinic',
    },
    {
      eyebrow: 'About GreenLeaf Health Clinic',
      headingLead: 'Clinic details',
      headingMiddle: 'and information',
      headingEmphasis: 'for patients.',
      intro: 'GreenLeaf Health Clinic provides a point of contact for general clinic and appointment enquiries in Salem.',
      description: 'For personal medical advice, diagnosis, or urgent care, speak directly with a qualified healthcare professional or appropriate local service.',
      cta: 'Contact the clinic',
      badgeTitle: 'Salem, Tamil Nadu',
      badgeText: 'Clinic contact information',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'A healthcare professional speaking with a patient',
      valuesLabel: 'Patient information',
      values: [
        { title: 'Appointments', description: 'Ask the clinic about scheduling.' },
        { title: 'Visit details', description: 'Check what to bring before visiting.' },
        { title: 'Direct contact', description: 'Contact the clinic with enquiries.' },
      ],
    },
    {
      eyebrow: 'Visiting GreenLeaf Clinic',
      headingLead: 'Clear details',
      headingEmphasis: 'for your visit.',
      intro: 'Contact the clinic for current information and to discuss appointment availability.',
      cta: 'Ask the clinic',
      principles: [
        { title: 'Find general information', description: 'Review clinic details and available contact channels.' },
        { title: 'Ask about appointments', description: 'Contact the clinic directly for current availability.' },
        { title: 'Prepare for your visit', description: 'Ask what information or documents may be helpful to bring.' },
        { title: 'Speak to a professional', description: 'Contact a qualified healthcare professional for medical advice.' },
      ],
    },
    {
      eyebrow: 'Clinic enquiries',
      headingLead: 'Get in touch',
      headingEmphasis: 'with the clinic.',
      intro: 'Send a general enquiry or contact the clinic directly to ask about appointments.',
      steps: [
        { title: 'Contact the clinic', description: 'Share a general enquiry using the contact details provided.' },
        { title: 'Ask about your visit', description: 'Confirm appointment availability and what to bring.' },
        { title: 'Speak with the care team', description: 'Discuss care questions directly with a qualified professional.' },
      ],
      footerText: 'This website is not a substitute for professional medical advice.',
      footerCta: 'Contact the clinic',
    },
    {
      eyebrow: 'Contact GreenLeaf Health Clinic',
      headingLead: 'Clinic questions',
      headingEmphasis: 'or appointments?',
      intro: 'For medical advice or urgent concerns, contact a qualified healthcare professional directly.',
      formLabel: 'Contact GreenLeaf Health Clinic',
      formCta: 'Send your enquiry',
      demoReminder: 'Demo contact details: update the email, phone, and location before publishing.',
      servicePrompt: 'What general enquiry is this about?',
      projectPrompt: 'Please do not include sensitive medical details in this form.',
    },
  ),
  localRetail: businessProfile(
    'GreenLeaf Market',
    'G',
    'GreenLeaf',
    'Market',
    'Everyday goods for your neighbourhood',
    'GreenLeaf Market | Local Shop',
    'Explore GreenLeaf Market, a local shop in Salem, Tamil Nadu, and find store contact information.',
    { email: 'hello@greenleafmarket.example', phone: '+91 90000 00029', phoneLink: '+919000000029', address: 'Salem, Tamil Nadu' },
    {
      eyebrow: 'Your local shop in Salem',
      headingLead: 'Find your next',
      headingSecondLine: 'everyday',
      headingEmphasis: 'favourite',
      subheading: 'Explore the kinds of goods available, find store information, and contact the shop with product enquiries.',
      contactCta: 'Ask the shop',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1300&q=85',
      supportTitle: 'A little closer to home.',
      supportText: 'Get in touch about products and store details.',
      imageAlt: 'A thoughtfully arranged display of everyday goods in a local shop',
      noteLead: 'Local finds,',
      noteEmphasis: 'easy to explore.',
      imageCaption: 'Discover products and plan a store visit.',
      highlights: ['Product information', 'Store details', 'Local enquiries'],
    },
    {
      eyebrow: 'Explore the shop',
      headingLead: 'Browse useful',
      headingEmphasis: 'finds.',
      intro: 'Give visitors an overview of the products and store information they can ask about.',
      items: [
        { name: 'Everyday essentials', description: 'Share information about commonly requested household items.', symbol: '⌂' },
        { name: 'Food & pantry', description: 'Introduce available pantry goods and locally stocked items.', symbol: '◉' },
        { name: 'Personal care', description: 'Help visitors find out about personal care products in store.', symbol: '✳' },
        { name: 'Gifts & seasonal finds', description: 'Highlight gift ideas and seasonal ranges when available.', symbol: '✧' },
        { name: 'Product enquiries', description: 'Invite customers to contact the shop about item availability.', symbol: '↗' },
        { name: 'Store information', description: 'Provide useful details to help customers plan a visit.', symbol: '▤' },
      ],
      footerText: 'Product selection and availability may vary; ask the shop for details.',
      footerCta: 'Contact the shop',
    },
    {
      eyebrow: 'About GreenLeaf Market',
      headingLead: 'A local shop',
      headingMiddle: 'for everyday',
      headingEmphasis: 'discoveries.',
      intro: 'GreenLeaf Market is a local retail shop in Salem, Tamil Nadu.',
      description: 'Use this space to introduce the shop, describe its product categories, and share the practical information customers need before visiting.',
      cta: 'Ask about products',
      badgeTitle: 'Salem, Tamil Nadu',
      badgeText: 'Local shop & retail',
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'The entrance to a local retail shop',
      valuesLabel: 'Shop information',
      values: [
        { title: 'Product range', description: 'Explore the kinds of goods available.' },
        { title: 'Store details', description: 'Find location and visiting information.' },
        { title: 'Product questions', description: 'Ask the shop about availability.' },
      ],
    },
    {
      eyebrow: 'Shopping at GreenLeaf',
      headingLead: 'Useful details',
      headingEmphasis: 'before you visit.',
      intro: 'Find store information and contact the shop with questions about products.',
      cta: 'Contact the shop',
      principles: [
        { title: 'Explore product categories', description: 'Get an overview of the kinds of items the shop carries.' },
        { title: 'Ask about availability', description: 'Contact the shop for current product information.' },
        { title: 'Find store details', description: 'Check the location and plan your visit.' },
        { title: 'Get a direct response', description: 'Use the listed contact details for shop enquiries.' },
      ],
    },
    {
      eyebrow: 'A helpful way to shop',
      headingLead: 'Browse, ask,',
      headingEmphasis: 'then visit.',
      intro: 'Find out about the shop and get in touch if you need more details.',
      steps: [
        { title: 'Explore', description: 'Browse store information and product categories.' },
        { title: 'Ask', description: 'Contact the shop with a product or availability question.' },
        { title: 'Visit', description: 'Use the location details to plan your trip.' },
      ],
      footerText: 'Contact the shop for current product and store information.',
      footerCta: 'Ask the shop',
    },
    {
      eyebrow: 'Contact GreenLeaf Market',
      headingLead: 'Looking for',
      headingEmphasis: 'something?',
      intro: 'Get in touch with product questions or to ask about the shop.',
      formLabel: 'Contact GreenLeaf Market',
      formCta: 'Send your enquiry',
      demoReminder: 'Demo contact details: update the email, phone, and location before publishing.',
      servicePrompt: 'What are you enquiring about?',
      projectPrompt: 'Tell us what product or store information you need.',
    },
  ),
  professionalServices: businessProfile(
    'GreenLeaf Advisory',
    'G',
    'GreenLeaf',
    'Advisory',
    'Clear, practical professional support',
    'GreenLeaf Advisory | Professional Services',
    'Learn about GreenLeaf Advisory and get in touch to discuss professional services in Salem, Tamil Nadu.',
    { email: 'hello@greenleafadvisory.example', phone: '+91 90000 00030', phoneLink: '+919000000030', address: 'Salem, Tamil Nadu' },
    {
      eyebrow: 'Professional services in Salem',
      headingLead: 'Practical support',
      headingSecondLine: 'for your next',
      headingEmphasis: 'decision',
      subheading: 'Learn about the services available and get in touch to discuss your requirements and next steps.',
      contactCta: 'Discuss your needs',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1300&q=85',
      supportTitle: 'A clear place to start.',
      supportText: 'Ask about services and an initial discussion.',
      imageAlt: 'A professional workspace prepared for a client discussion',
      noteLead: 'Start with',
      noteEmphasis: 'a conversation.',
      imageCaption: 'Understand the service and what comes next.',
      highlights: ['Service information', 'Initial discussion', 'Direct enquiries'],
    },
    {
      eyebrow: 'Professional services',
      headingLead: 'Support for',
      headingEmphasis: 'your needs.',
      intro: 'Introduce the professional services available and help prospective clients find the right contact.',
      items: [
        { name: 'Initial consultation', description: 'Discuss your situation and understand the available service options.', symbol: '⌁' },
        { name: 'Business support', description: 'Ask about practical support relevant to your organisation.', symbol: '▤' },
        { name: 'Project guidance', description: 'Talk through a defined project and the help you are looking for.', symbol: '↗' },
        { name: 'Ongoing advisory', description: 'Enquire about recurring or ongoing professional support.', symbol: '◉' },
        { name: 'Document review', description: 'Ask whether document or process review is within the service scope.', symbol: '⌘' },
        { name: 'General enquiries', description: 'Get in touch to discuss a question not listed here.', symbol: '✳' },
      ],
      footerText: 'The right service depends on your requirements; get in touch to discuss them.',
      footerCta: 'Discuss your needs',
    },
    {
      eyebrow: 'About GreenLeaf Advisory',
      headingLead: 'Professional help',
      headingMiddle: 'with a practical',
      headingEmphasis: 'approach.',
      intro: 'GreenLeaf Advisory provides professional services from Salem, Tamil Nadu.',
      description: 'Use this section to explain the work you do, who you support, and how a prospective client can start a conversation about their requirements.',
      cta: 'Discuss your requirements',
      badgeTitle: 'Salem, Tamil Nadu',
      badgeText: 'Professional services',
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'A bright professional workspace prepared for a discussion',
      valuesLabel: 'Working together',
      values: [
        { title: 'Understand', description: 'Discuss your needs and context.' },
        { title: 'Clarify', description: 'Review scope and possible next steps.' },
        { title: 'Connect', description: 'Get in touch to begin a discussion.' },
      ],
    },
    {
      eyebrow: 'Working with GreenLeaf',
      headingLead: 'A considered',
      headingEmphasis: 'way forward.',
      intro: 'Start with an open conversation about your needs and the professional support you are looking for.',
      cta: 'Start a discussion',
      principles: [
        { title: 'Understand your context', description: 'Begin with your requirements, goals, and constraints.' },
        { title: 'Clarify the scope', description: 'Discuss what is included and what further information is needed.' },
        { title: 'Communicate clearly', description: 'Keep questions, decisions, and next steps easy to follow.' },
        { title: 'Agree what comes next', description: 'Decide together whether and how to proceed.' },
      ],
    },
    {
      eyebrow: 'A straightforward process',
      headingLead: 'Understand,',
      headingEmphasis: 'then proceed.',
      intro: 'A conversation helps establish whether the service fits your needs and what information is needed.',
      steps: [
        { title: 'Get in touch', description: 'Describe the kind of professional support you are looking for.' },
        { title: 'Discuss scope', description: 'Review your requirements and the service options available.' },
        { title: 'Agree next steps', description: 'Confirm what happens next if the service is a good fit.' },
      ],
      footerText: 'Service scope and availability are discussed directly.',
      footerCta: 'Start a discussion',
    },
    {
      eyebrow: 'Contact GreenLeaf Advisory',
      headingLead: 'Discuss your',
      headingEmphasis: 'requirements.',
      intro: 'Share a general enquiry about the professional support you are looking for.',
      formLabel: 'Contact GreenLeaf Advisory',
      formCta: 'Send your enquiry',
      demoReminder: 'Demo contact details: update the email, phone, and location before publishing.',
      servicePrompt: 'Which service would you like to discuss?',
      projectPrompt: 'Briefly describe the support you are looking for.',
    },
  ),
  portfolioPersonalBrand: businessProfile(
    'GreenLeaf Creative',
    'G',
    'GreenLeaf',
    'Creative',
    'Selected work, practice, and contact information',
    'GreenLeaf Creative | Portfolio',
    'Explore the work and practice of GreenLeaf Creative in Salem, Tamil Nadu.',
    { email: 'hello@greenleafcreative.example', phone: '+91 90000 00031', phoneLink: '+919000000031', address: 'Salem, Tamil Nadu' },
    {
      eyebrow: 'Independent creative practice',
      headingLead: 'Thoughtful work,',
      headingSecondLine: 'made with',
      headingEmphasis: 'intention',
      subheading: 'Explore selected work, learn about the creative practice, and get in touch about a potential collaboration.',
      contactCta: 'Discuss a project',
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1300&q=85',
      supportTitle: 'An idea worth exploring.',
      supportText: 'Start a conversation about your project.',
      imageAlt: 'A creative workspace with sketches and working materials',
      noteLead: 'Good work begins',
      noteEmphasis: 'with a question.',
      imageCaption: 'A selection of work and ways to connect.',
      highlights: ['Selected work', 'Creative practice', 'Project enquiries'],
    },
    {
      eyebrow: 'Selected work & practice',
      headingLead: 'Explore the',
      headingEmphasis: 'practice.',
      intro: 'Present selected areas of work and the creative services available for collaboration.',
      items: [
        { name: 'Identity & art direction', description: 'Share selected identity work and visual direction projects.', symbol: '◉' },
        { name: 'Digital design', description: 'Show interface and digital design work with relevant project context.', symbol: '▤' },
        { name: 'Editorial & content', description: 'Introduce editorial, writing, or content projects from the portfolio.', symbol: '⌁' },
        { name: 'Illustration & image-making', description: 'Present illustration and image work with a short description.', symbol: '✳' },
        { name: 'Independent projects', description: 'Share personal explorations and self-directed creative work.', symbol: '✧' },
        { name: 'Collaboration enquiries', description: 'Invite potential collaborators to get in touch about a project.', symbol: '↗' },
      ],
      footerText: 'Have a project in mind? Share a little about it.',
      footerCta: 'Discuss a collaboration',
    },
    {
      eyebrow: 'About GreenLeaf Creative',
      headingLead: 'A creative',
      headingMiddle: 'practice shaped by',
      headingEmphasis: 'curiosity.',
      intro: 'GreenLeaf Creative is an independent creative practice based in Salem, Tamil Nadu.',
      description: 'Use this section to describe your approach, areas of interest, and the kinds of projects or collaborations you are open to.',
      cta: 'Get in touch',
      badgeTitle: 'Salem, Tamil Nadu',
      badgeText: 'Independent creative practice',
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'A notebook and writing tools on a creative workspace',
      valuesLabel: 'Practice & collaboration',
      values: [
        { title: 'Selected work', description: 'Explore a considered selection of projects.' },
        { title: 'Creative approach', description: 'Learn how the practice takes shape.' },
        { title: 'Collaboration', description: 'Start a conversation about working together.' },
      ],
    },
    {
      eyebrow: 'Working together',
      headingLead: 'Good work is',
      headingEmphasis: 'a conversation.',
      intro: 'Share an idea, ask a question, or discuss whether a collaboration could be a good fit.',
      cta: 'Discuss a project',
      principles: [
        { title: 'Start with the idea', description: 'Describe what you are exploring and what you hope to make.' },
        { title: 'Share context', description: 'Discuss the audience, format, timing, and other project details.' },
        { title: 'Explore possibilities', description: 'Talk through the approach and potential scope together.' },
        { title: 'Decide next steps', description: 'Agree whether and how to continue the conversation.' },
      ],
    },
    {
      eyebrow: 'A creative collaboration',
      headingLead: 'An idea,',
      headingEmphasis: 'in good company.',
      intro: 'A few clear steps help decide whether a project and collaboration are a good fit.',
      steps: [
        { title: 'Share the idea', description: 'Send an outline of the project or question you have in mind.' },
        { title: 'Talk it through', description: 'Discuss context, creative direction, and practical details.' },
        { title: 'Agree what follows', description: 'Decide together on scope and a useful next step.' },
      ],
      footerText: 'Project fit, scope, and timing are discussed individually.',
      footerCta: 'Discuss a project',
    },
    {
      eyebrow: 'Project enquiries',
      headingLead: 'Have an idea',
      headingEmphasis: 'to discuss?',
      intro: 'Share a little about your project or collaboration enquiry.',
      formLabel: 'Contact GreenLeaf Creative',
      formCta: 'Send your enquiry',
      demoReminder: 'Demo contact details: update the email, phone, and location before publishing.',
      servicePrompt: 'What kind of project are you enquiring about?',
      projectPrompt: 'Share a little context about your idea or collaboration.',
    },
  ),
};

export const ACTIVE_BUSINESS_TYPE: BusinessType = 'salonBeauty';
export const ACTIVE_BUSINESS_TYPE_TOKEN = new InjectionToken<BusinessType>('ACTIVE_BUSINESS_TYPE', {
  providedIn: 'root',
  factory: () => ACTIVE_BUSINESS_TYPE,
});
export const BUSINESS_PROFILE = new InjectionToken<BusinessProfile>('BUSINESS_PROFILE', {
  providedIn: 'root',
  factory: () => BUSINESS_PROFILES[inject(ACTIVE_BUSINESS_TYPE_TOKEN)],
});
