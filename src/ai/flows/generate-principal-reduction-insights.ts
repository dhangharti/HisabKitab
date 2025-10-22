// src/ai/flows/generate-principal-reduction-insights.ts
'use server';

/**
 * @fileOverview Generates insights into principal reduction over time for each loan.
 *
 * - generatePrincipalReductionInsights - A function that generates insights into principal reduction for each loan.
 * - GeneratePrincipalReductionInsightsInput - The input type for the generatePrincipalReductionInsights function.
 * - GeneratePrincipalReductionInsightsOutput - The return type for the generatePrincipalReductionInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePrincipalReductionInsightsInputSchema = z.object({
  loans: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      principal: z.number(),
      rate: z.number(),
      years: z.number(),
      startDateYear: z.number(),
      startDateMonth: z.number(),
    })
  ).describe('An array of loan objects with details like principal, rate, and term.'),
  currentYearBs: z.number().describe('The current year in Bikram Sambat.'),
  currentMonthBs: z.number().describe('The current month in Bikram Sambat.'),
});
export type GeneratePrincipalReductionInsightsInput = z.infer<typeof GeneratePrincipalReductionInsightsInputSchema>;

const GeneratePrincipalReductionInsightsOutputSchema = z.object({
  insights: z.array(
    z.object({
      loanId: z.string().describe('The ID of the loan.'),
      loanName: z.string().describe('The name of the loan.'),
      summary: z.string().describe('A summary of the principal reduction insights for the loan.'),
    })
  ).describe('An array of insights, one for each loan.'),
});
export type GeneratePrincipalReductionInsightsOutput = z.infer<typeof GeneratePrincipalReductionInsightsOutputSchema>;

export async function generatePrincipalReductionInsights(
  input: GeneratePrincipalReductionInsightsInput
): Promise<GeneratePrincipalReductionInsightsOutput> {
  return generatePrincipalReductionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'principalReductionInsightsPrompt',
  input: {schema: GeneratePrincipalReductionInsightsInputSchema},
  output: {schema: GeneratePrincipalReductionInsightsOutputSchema},
  prompt: `You are a financial advisor specializing in debt management. Generate insights into how the principal is being reduced over time for each loan.

For each loan, provide a concise summary of the principal reduction, including key metrics like the initial principal, current outstanding balance, total principal paid to date, and an estimated timeline for payoff based on current payment patterns.

Consider providing advice on strategies to accelerate principal reduction, such as making extra payments or consolidating debt.

Current Year (BS): {{{currentYearBs}}}
Current Month (BS): {{{currentMonthBs}}}

Loans:
{{#each loans}}
Loan ID: {{{id}}}
Loan Name: {{{name}}}
Principal: {{{principal}}}
Rate: {{{rate}}}
Years: {{{years}}}
Start Date (Year): {{{startDateYear}}}
Start Date (Month): {{{startDateMonth}}}
{{/each}}`,
});

const generatePrincipalReductionInsightsFlow = ai.defineFlow(
  {
    name: 'generatePrincipalReductionInsightsFlow',
    inputSchema: GeneratePrincipalReductionInsightsInputSchema,
    outputSchema: GeneratePrincipalReductionInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
