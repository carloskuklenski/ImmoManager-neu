export interface Property {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
  purchasePrice?: number;
  purchaseDate?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Portfolio {
  id: string;
  owner_id: string;
  name: string;
  permission?: 'read' | 'write';
}

export interface Unit {
  id: string;
  propertyId: string;
  name: string;
  sizeSqm: number;
  rooms: number;
}

export interface Tenant {
  id: string;
  unitId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rent: number;
  utilities: number;
  deposit: number;
  leaseStart: string;
  leaseEnd?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
  entityType: 'unit' | 'tenant' | 'calculation';
  entityId: string;
}

export interface UtilityCostItem {
  id: string;
  name: string;
  amount: number;
  totalAmount?: number;
}

export interface UtilitySettlement {
  id: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  costItems: UtilityCostItem[];
  advancePayments: number;
  createdAt: string;
}

export interface RentIncrease {
  id: string;
  tenantId: string;
  date: string;
  effectiveDate: string;
  oldRent: number;
  newRent: number;
  reason: 'mietspiegel' | 'index' | 'modernisierung' | 'energieeffizienz' | 'sonstiges';
  capPercentage: number;
  justificationText: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface YieldCalculation {
  id: string;
  name: string;
  type: 'buy_and_hold' | 'fix_and_flip';
  purchasePrice: number;
  purchaseCostsPercentage: number;
  renovationCosts: number;
  monthlyRent?: number;
  maintenanceCostsYearly?: number;
  expectedSalePrice?: number;
  holdingPeriodMonths?: number;
  links: string[];
  createdAt: string;
}



export type WorkKind = 'Leerstand' | 'Übergabe' | 'Wartung' | 'Zähler' | 'Bewerbung' | 'Aufgabe';
export type WorkStatus = 'Offen' | 'In Bearbeitung' | 'Erledigt';
export interface WorkItem {
  id: string;
  title: string;
  kind: WorkKind;
  location: string;
  dueDate: string;
  status: WorkStatus;
  notes: string;
  createdAt: string;
}
