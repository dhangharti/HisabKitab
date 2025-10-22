
import type { AppData, Loan } from './types';
import { generateLoanSchedule } from './loan-calculations';

export const BS_MONTHS = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
    'कार्तिक', 'मंसिर', 'पुस', 'माघ', 'फाल्गुन', 'चैत'
];

export const BS_YEAR_START = 2075;
export const BS_YEAR_END = 2095;

export const INITIAL_LOAN_CONFIG: Omit<Loan, 'id' | 'extraPrincipal' | 'schedule'> = {
  name: "नयाँ ऋण",
  principal: 1000000,
  rate: 10.0,
  years: 5,
  startDateYear: 2081,
  startDateMonth: 1, 
};


export const INITIAL_DATA: AppData = {
    incomes: [],
    expenses: [],
    wants: [],
    investments: [],
    loans: []
};
