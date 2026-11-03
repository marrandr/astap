import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UploadedFile } from '../../common/uploads.js';

const IMAGE_ENDPOINT = 'https://api.aiornot.com/v2/image/sync';

@Injectable()
export class AiornotService {
  constructor(private readonly config: ConfigService) {}

  async analyze(file: UploadedFile): Promise<{ aiScore: number; detail: Record<string, unknown> }> {
    const apiKey =
      this.config.get<string>('AIORNOT_API_KEY') ?? this.config.get<string>('AI_OR_NOT_API');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'La clé AIORNOT_API_KEY ou AI_OR_NOT_API est absente de la configuration',
      );
    }

    const form = new FormData();
    form.append('image', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);

    let response: Response;
    try {
      response = await fetch(IMAGE_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } catch {
      throw new BadGatewayException("Le service d'analyse d'image est indisponible");
    }

    if (!response.ok) {
      throw new BadGatewayException(`AI or Not a refusé l'analyse (HTTP ${response.status})`);
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new BadGatewayException("Réponse invalide du service d'analyse d'image");
    }

    const detail = payload as Record<string, unknown>;
    const report = detail.report;
    const aiScore = this.getAiGeneratedConfidence(report) ?? this.findAiScore(report);
    if (aiScore === null) {
      throw new BadGatewayException("Le rapport AI or Not ne contient pas de score AI exploitable");
    }

    return { aiScore, detail };
  }

  private getAiGeneratedConfidence(value: unknown): number | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const report = value as Record<string, unknown>;
    const aiGenerated = report.ai_generated;
    if (!aiGenerated || typeof aiGenerated !== 'object' || Array.isArray(aiGenerated)) return null;
    const ai = (aiGenerated as Record<string, unknown>).ai;
    if (!ai || typeof ai !== 'object' || Array.isArray(ai)) return null;
    const confidence = (ai as Record<string, unknown>).confidence;
    return typeof confidence === 'number' && Number.isFinite(confidence) ? confidence : null;
  }

  private findAiScore(value: unknown): number | null {
    if (!value || typeof value !== 'object') return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const score = this.findAiScore(item);
        if (score !== null) return score;
      }
      return null;
    }

    const record = value as Record<string, unknown>;
    for (const [key, candidate] of Object.entries(record)) {
      if (/ai.?generated/i.test(key)) {
        if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
        if (candidate && typeof candidate === 'object') {
          const nested = candidate as Record<string, unknown>;
          for (const scoreKey of ['score', 'probability', 'confidence']) {
            const score = nested[scoreKey];
            if (typeof score === 'number' && Number.isFinite(score)) return score;
          }
        }
      }
    }
    for (const candidate of Object.values(record)) {
      const score = this.findAiScore(candidate);
      if (score !== null) return score;
    }
    return null;
  }
}
