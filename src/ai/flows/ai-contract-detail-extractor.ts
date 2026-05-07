'use server';
/**
 * @fileOverview An AI agent that extracts key details from uploaded PDF contracts.
 *
 * - extractContractDetails - A function that handles the contract detail extraction process.
 * - AIContractDetailExtractorInput - The input type for the extractContractDetails function.
 * - AIContractDetailExtractorOutput - The return type for the extractContractDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIContractDetailExtractorInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF contract, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AIContractDetailExtractorInput = z.infer<typeof AIContractDetailExtractorInputSchema>;

const AIContractDetailExtractorOutputSchema = z.object({
  clientName: z.string().describe('The name of the client as found in the contract.'),
  serviceType: z.string().describe('The type of service mentioned in the contract (e.g., "Website Development", "Custom Application", "Management System").'),
  monthlyValue: z.number().describe('The monthly recurring value or cost specified in the contract. Provide as a number without currency symbols.'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The start date of the contract in YYYY-MM-DD format.'),
  paymentTerms: z.string().describe('The payment terms and frequency specified in the contract (e.g., "Net 30", "monthly upfront", "quarterly in arrears").'),
});
export type AIContractDetailExtractorOutput = z.infer<typeof AIContractDetailExtractorOutputSchema>;

export async function extractContractDetails(input: AIContractDetailExtractorInput): Promise<AIContractDetailExtractorOutput> {
  return aiContractDetailExtractorFlow(input);
}

const aiContractDetailExtractorPrompt = ai.definePrompt({
  name: 'aiContractDetailExtractorPrompt',
  input: { schema: AIContractDetailExtractorInputSchema },
  output: { schema: AIContractDetailExtractorOutputSchema },
  prompt: `You are an expert contract analyst. Your task is to extract key details from the provided PDF contract.
Carefully read the document and identify the following information:
- Client Name: The full name of the client or company.
- Service Type: The primary service being provided.
- Monthly Value: The recurring monthly payment amount. Extract this as a number without any currency symbols.
- Start Date: The effective start date of the contract. Ensure it is in YYYY-MM-DD format.
- Payment Terms: The agreed-upon payment schedule and conditions.

Extract the information in the specified JSON format.

Contract PDF: {{media url=pdfDataUri}}`,
});

const aiContractDetailExtractorFlow = ai.defineFlow(
  {
    name: 'aiContractDetailExtractorFlow',
    inputSchema: AIContractDetailExtractorInputSchema,
    outputSchema: AIContractDetailExtractorOutputSchema,
  },
  async (input) => {
    const { output } = await aiContractDetailExtractorPrompt(input);
    return output!;
  }
);
