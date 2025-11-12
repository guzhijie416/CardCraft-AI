import { config } from 'dotenv';
config();

import '@/ai/flows/generate-ai-card-from-prompt.ts';
import '@/ai/flows/filter-ai-content-for-inappropriate-content.ts';
import '@/ai/flows/summarize-and-improve-user-prompt.ts';