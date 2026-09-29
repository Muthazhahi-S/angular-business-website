export const APP_PAGES = [
  'Dashboard',
  'Leads',
  'Customer Enquiries',
  'AI Assistant',
  'Business Profile',
  'Settings',
] as const;

export type AppPage = (typeof APP_PAGES)[number];

export type DashboardQuickAction =
  | 'addLead'
  | 'addEnquiry'
  | 'viewLeads'
  | 'viewEnquiries'
  | 'aiAssistant';
