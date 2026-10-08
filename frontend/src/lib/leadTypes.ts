// Categories of the admin outreach leads (Lead.type). Keep in sync with
// LEAD_TYPES in backend/src/routes/leads.js.
import { Briefcase, BedDouble, Building2, Coffee, HelpCircle, Home, Hotel, Map, ShoppingBag, Tent, Utensils, type LucideIcon } from 'lucide-react';

export interface LeadType { id: string; label: string; group: LeadGroupId; icon: LucideIcon }
export type LeadGroupId = 'stay' | 'food' | 'shop' | 'tour' | 'other';

export const LEAD_GROUPS: { id: LeadGroupId; label: string }[] = [
  { id: 'stay',  label: 'Accommodation' },
  { id: 'food',  label: 'Restaurants & cafés' },
  { id: 'shop',  label: 'Shops' },
  { id: 'tour',  label: 'Tours & guides' },
  { id: 'other', label: 'Other' },
];

export const LEAD_TYPES: LeadType[] = [
  { id: 'riad',       label: 'Riad',           group: 'stay',  icon: Building2 },
  { id: 'hotel',      label: 'Hotel',          group: 'stay',  icon: Hotel },
  { id: 'guesthouse', label: 'Guest house',    group: 'stay',  icon: Home },
  { id: 'hostel',     label: 'Hostel',         group: 'stay',  icon: BedDouble },
  { id: 'camp',       label: 'Desert camp',    group: 'stay',  icon: Tent },
  { id: 'agency',     label: 'Booking agency', group: 'stay',  icon: Briefcase },
  { id: 'restaurant', label: 'Restaurant',     group: 'food',  icon: Utensils },
  { id: 'cafe',       label: 'Café',           group: 'food',  icon: Coffee },
  { id: 'boutique',   label: 'Shop',           group: 'shop',  icon: ShoppingBag },
  { id: 'tour_guide', label: 'Tour guide',     group: 'tour',  icon: Map },
  { id: 'other',      label: 'Other',          group: 'other', icon: HelpCircle },
];

const BY_ID = Object.fromEntries(LEAD_TYPES.map((t) => [t.id, t]));
export const leadType = (id: string): LeadType => BY_ID[id] ?? { id, label: id.replace(/_/g, ' '), group: 'other', icon: Building2 };
