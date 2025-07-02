import { GoogleGenAI } from "@google/genai";
import type { Project, Transaction, Equipment } from "@shared/schema";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CostEstimate {
  estimatedCost: number;
  breakdown: {
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
  confidence: number;
  factors: string[];
}

export interface TimelineEstimate {
  estimatedDuration: number; // in days
  criticalPath: string[];
  phases: {
    name: string;
    duration: number;
    dependencies: string[];
  }[];
  risks: string[];
}

export interface ProjectInsight {
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  costOptimization: string[];
  timelineOptimization: string[];
}

export class ConstructionAIService {
  async analyzeCostEstimation(
    projectDescription: string,
    projectCategory: string,
    location: string,
    requirements: string[]
  ): Promise<CostEstimate> {
    try {
      const prompt = `
As a construction cost estimation expert, analyze this project and provide a detailed cost breakdown:

Project Category: ${projectCategory}
Location: ${location}
Description: ${projectDescription}
Requirements: ${requirements.join(', ')}

Provide a JSON response with:
1. Total estimated cost in YER
2. Breakdown by materials, labor, equipment, overhead (percentages)
3. Confidence level (0-1)
4. Key cost factors

Consider Yemeni construction market rates, local material costs, and labor availability.
Response format:
{
  "estimatedCost": number,
  "breakdown": {
    "materials": number,
    "labor": number, 
    "equipment": number,
    "overhead": number
  },
  "confidence": number,
  "factors": ["factor1", "factor2", ...]
}
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      const text = response.text || "";
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error("Invalid AI response format");
    } catch (error) {
      console.error("Cost estimation error:", error);
      throw new Error("Failed to generate cost estimate");
    }
  }

  async predictProjectTimeline(
    projectDescription: string,
    projectType: string,
    complexity: 'simple' | 'medium' | 'complex',
    teamSize: number
  ): Promise<TimelineEstimate> {
    try {
      const prompt = `
As a construction project management expert, analyze this project timeline:

Project Type: ${projectType}
Complexity: ${complexity}
Team Size: ${teamSize}
Description: ${projectDescription}

Provide realistic timeline estimation for Yemeni construction context including:
1. Total duration in days
2. Critical path activities
3. Project phases with dependencies
4. Potential risks and delays

Response format:
{
  "estimatedDuration": number,
  "criticalPath": ["activity1", "activity2", ...],
  "phases": [
    {
      "name": "phase name",
      "duration": number,
      "dependencies": ["dependency1", ...]
    }
  ],
  "risks": ["risk1", "risk2", ...]
}
      `;

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error("Invalid AI response format");
    } catch (error) {
      console.error("Timeline prediction error:", error);
      throw new Error("Failed to predict timeline");
    }
  }

  async generateProjectInsights(
    project: Project,
    transactions: Transaction[],
    equipment: Equipment[]
  ): Promise<ProjectInsight> {
    try {
      const prompt = `
Analyze this construction project performance and provide insights:

Project: ${project.name} (${project.type})
Status: ${project.status}
Budget: ${project.budget} YER
Progress: ${project.progress}%
Start Date: ${project.startDate}
End Date: ${project.endDate}

Transactions: ${transactions.length} total transactions
Equipment: ${equipment.length} pieces of equipment

Provide analysis with:
1. Risk assessment (low/medium/high)
2. Recommendations for improvement
3. Cost optimization suggestions
4. Timeline optimization suggestions

Response format:
{
  "riskLevel": "low|medium|high",
  "recommendations": ["rec1", "rec2", ...],
  "costOptimization": ["opt1", "opt2", ...],
  "timelineOptimization": ["time1", "time2", ...]
}
      `;

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      });

      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error("Invalid AI response format");
    } catch (error) {
      console.error("Project insights error:", error);
      throw new Error("Failed to generate insights");
    }
  }

  async analyzeDocument(fileBuffer: Buffer, mimeType: string): Promise<{
    summary: string;
    keyInformation: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
Analyze this construction document and extract:
1. Summary of content
2. Key information and details
3. Recommendations or action items

Focus on construction-related information, costs, timelines, specifications, and compliance requirements.
Provide response in Arabic and English.
      `;

      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: fileBuffer.toString('base64'),
                  mimeType: mimeType
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      const response = await result.response;
      const text = response.text();
      
      return {
        summary: text.split('\n')[0] || 'Document analyzed',
        keyInformation: text.split('\n').slice(1, 4) || [],
        recommendations: text.split('\n').slice(4) || []
      };
    } catch (error) {
      console.error("Document analysis error:", error);
      throw new Error("Failed to analyze document");
    }
  }
}

export const aiService = new ConstructionAIService();