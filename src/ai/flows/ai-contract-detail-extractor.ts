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
      "A PDF contract, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type AIContractDetailExtractorInput = z.infer<typeof AIContractDetailExtractorInputSchema>;

const AIContractDetailExtractorOutputSchema = z.object({
  clientName: z.string().describe('The name of the client or company as found in the contract.'),
  serviceType: z.string().describe('The type of service mentioned (e.g., "Desenvolvimento Web", "Consultoria").'),
  monthlyValue: z.number().describe('The recurring monthly value as a number. No currency symbols.'),
  startDate: z.string().describe('The start date of the contract. Use YYYY-MM-DD format if possible, or the date as text.'),
  paymentTerms: z.string().describe('Briefly describe the payment terms found.'),
});
export type AIContractDetailExtractorOutput = z.infer<typeof AIContractDetailExtractorOutputSchema>;

export async function extractContractDetails(input: AIContractDetailExtractorInput): Promise<AIContractDetailExtractorOutput> {
  try {
    return await aiContractDetailExtractorFlow(input);
  } catch (error) {
    console.error("AI Flow Execution Error:", error);
    throw new Error("Falha ao processar o contrato com IA.");
  }
}

const aiContractDetailExtractorPrompt = ai.definePrompt({
  name: 'aiContractDetailExtractorPrompt',
  input: { schema: AIContractDetailExtractorInputSchema },
  output: { schema: AIContractDetailExtractorOutputSchema },
  prompt: `Você é um analista de contratos especialista. Sua tarefa é ler o PDF fornecido e extrair informações cruciais.
  
  Extraia os seguintes campos:
  - Nome do Cliente
  - Tipo de Serviço
  - Valor Mensal (apenas o número)
  - Data de Início
  - Termos de Pagamento
  
  Se não encontrar algum campo, forneça uma estimativa lógica ou marque como "Não identificado no documento".
  
  Documento PDF: {{media url=pdfDataUri}}`,
});

const aiContractDetailExtractorFlow = ai.defineFlow(
  {
    name: 'aiContractDetailExtractorFlow',
    inputSchema: AIContractDetailExtractorInputSchema,
    outputSchema: AIContractDetailExtractorOutputSchema,
  },
  async (input) => {
    const { output } = await aiContractDetailExtractorPrompt(input);
    if (!output) {
      throw new Error("A IA não retornou resultados válidos para este documento.");
    }
    return output;
  }
);
