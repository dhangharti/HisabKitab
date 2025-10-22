'use server';
/**
 * @fileOverview AI agent that analyzes user's financial situation and provides debt repayment recommendations.
 *
 * - analyzeDebtRepayment - A function that analyzes income, expenses, and loan details and suggests debt repayment strategies.
 * - DebtRepaymentInput - The input type for the analyzeDebtRepayment function.
 * - DebtRepaymentOutput - The return type for the analyzeDebtRepayment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebtRepaymentInputSchema = z.object({
  incomes: z.array(
    z.object({
      name: z.string().describe('Name of the income source'),
      amount: z.number().describe('Amount of income'),
    })
  ).describe('List of income sources and amounts'),
  expenses: z.array(
    z.object({
      name: z.string().describe('Name of the expense'),
      amount: z.number().describe('Amount of expense'),
    })
  ).describe('List of expenses and amounts'),
  loans: z.array(
    z.object({
      name: z.string().describe('Name of the loan'),
      principal: z.number().describe('Principal amount of the loan'),
      rate: z.number().describe('Annual interest rate of the loan'),
      years: z.number().describe('Loan term in years'),
      startDateYear: z.number().describe('Year the loan started'),
      startDateMonth: z.number().describe('Month the loan started'),
      extraPrincipal: z.number().optional().describe('Extra principal payment for the current month'),
    })
  ).describe('List of loan details'),
});
export type DebtRepaymentInput = z.infer<typeof DebtRepaymentInputSchema>;

const DebtRepaymentOutputSchema = z.object({
  recommendations: z.string().describe('Personalized recommendations on debt repayment strategies.'),
});
export type DebtRepaymentOutput = z.infer<typeof DebtRepaymentOutputSchema>;

export async function analyzeDebtRepayment(input: DebtRepaymentInput): Promise<DebtRepaymentOutput> {
  return analyzeDebtRepaymentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'debtRepaymentPrompt',
  input: {schema: DebtRepaymentInputSchema},
  output: {schema: DebtRepaymentOutputSchema},
  prompt: `You are a financial advisor specializing in debt repayment strategies.

  Analyze the user's income, expenses, and loan details to provide personalized recommendations on how to minimize interest paid and accelerate debt payoff.

  Consider options such as optimal extra principal payments, debt consolidation, or other strategies.

  Incomes:{{#each incomes}}{{{name}}}: {{{amount}}} {{/each}}
  Expenses:{{#each expenses}}{{{name}}}: {{{amount}}} {{/each}}
  Loans:{{#each loans}}Name: {{{name}}}, Principal: {{{principal}}}, Rate: {{{rate}}}, Years: {{{years}}}, Start Date: {{{startDateYear}}}-{{{startDateMonth}}}, Extra Principal: {{{extraPrincipal}}} {{/each}}

  Provide clear and actionable recommendations based on the user's financial situation.
  Response should be in Nepali.
  `,
});

const analyzeDebtRepaymentFlow = ai.defineFlow(
  {
    name: 'analyzeDebtRepaymentFlow',
    inputSchema: DebtRepaymentInputSchema,
    outputSchema: DebtRepaymentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
