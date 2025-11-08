import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { CalendarEvent, AttendanceRecord, GroundingSource } from '../types';

// Store the chat instance at the module level to maintain conversation history.
let chat: Chat | null = null;

const getGenAI = () => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export interface ChatStreamChunk {
    text?: string;
    sources?: GroundingSource[];
}

const initializeChat = () => {
    const ai = getGenAI();
    if (!ai) return;

    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are DTU-Bot, a friendly and helpful AI assistant for students of Delhi Technological University (DTU). Your goal is to provide accurate, concise, and academically-focused answers. Format your responses using Markdown for clarity: use double asterisks for bolding (e.g., **Topic**) and bullet points (using a single asterisk `*`) for lists. When asked about official information like syllabus, timetables, or updates for students, prioritize searching and citing information directly from the official Delhi Technological University website: dtu.ac.in. Always list your sources.',
            tools: [{googleSearch: {}}],
        },
    });
};


export async function* runChatStream(prompt: string): AsyncGenerator<ChatStreamChunk> {
    // Initialize chat on the first call.
    if (!chat) {
        initializeChat();
    }
    
    // If initialization failed (e.g., no API key), yield an error message.
    if (!chat) {
        yield { text: "I'm sorry, my connection to the server is not configured. Please check the API key." };
        return;
    }

    try {
        const result = await chat.sendMessageStream({ message: prompt });
        for await (const chunk of result) {
            const output: ChatStreamChunk = {};
            if (chunk.text) {
                output.text = chunk.text;
            }

            const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks && groundingChunks.length > 0) {
                 output.sources = groundingChunks
                    .map(gc => gc.web)
                    .filter((web): web is { uri: string; title: string } => !!web && !!web.uri && !!web.title) 
                    .map(web => ({ uri: web.uri, title: web.title }));
            }

            if (output.text || (output.sources && output.sources.length > 0)) {
                yield output;
            }
        }
    } catch (error) {
        console.error("Error in Gemini chat stream:", error);
        yield { text: "I'm having trouble connecting right now. Please try again in a moment." };
    }
}

export async function parseEventFromPrompt(prompt: string): Promise<Omit<CalendarEvent, 'id'> | null> {
    const ai = getGenAI();
    if (!ai) {
        throw new Error("Gemini AI not initialized. Check API Key.");
    }

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Parse the user request to create a calendar event. Today's date is ${new Date().toDateString()}. The current year is ${new Date().getFullYear()}. Respond with ONLY the raw JSON object, without any markdown formatting, backticks, or conversational text. The date must be in YYYY-MM-DD format. For relative dates like "next Tuesday", calculate it based on today. Classify the event type as follows: 'deadline' for tasks with due dates (e.g., 'submit assignment', 'project due'), 'reminder' for simple reminders (e.g., 'remind me to call'), or 'event' for scheduled activities (e.g., 'midterm exam', 'society meeting', 'doctor's appointment').\n\nUser prompt: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "A concise title for the event."
                        },
                        date: {
                            type: Type.STRING,
                            description: "The date of the event in YYYY-MM-DD format."
                        },
                        type: {
                            type: Type.STRING,
                            enum: ['event', 'deadline', 'reminder'],
                            description: "The type of event. Must be one of: 'event', 'deadline', or 'reminder'."
                        }
                    },
                    required: ["title", "date", "type"]
                }
            }
        });

        let jsonString = result.text.trim();

        // Defensive cleanup: find the JSON block in case the model adds extra text
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }

        const parsedEvent = JSON.parse(jsonString) as Omit<CalendarEvent, 'id'>;

        // Basic validation
        if (parsedEvent.title && parsedEvent.date && parsedEvent.type && ['event', 'deadline', 'reminder'].includes(parsedEvent.type)) {
            return parsedEvent;
        }
        return null;

    } catch (error) {
        console.error("Error parsing event with Gemini:", error);
        return null;
    }
}

export async function getAttendanceAdvice(records: AttendanceRecord[], prompt: string): Promise<string> {
    const ai = getGenAI();
    if (!ai) {
        throw new Error("Gemini AI not initialized. Check API Key.");
    }

    const attendanceContext = records.map(r => 
        `${r.subjectName}: ${r.attended} attended out of ${r.total} total classes.`
    ).join('\n');

    const fullPrompt = `You are an academic advisor for a DTU student. The university requires a minimum of 75% attendance in each subject to be eligible for exams.
    
Here is the student's current attendance record:
${attendanceContext}

The student asks: "${prompt}"

Based on their record and the 75% rule, provide a clear, concise, and helpful answer. Perform any necessary calculations. For example, if they ask how many classes they can miss, calculate the maximum number of classes they can miss without dropping below 75%. Be encouraging and supportive. **Format your response using Markdown, with bold headings and bullet points for lists.**`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error getting attendance advice from Gemini:", error);
        return "I'm having trouble connecting right now. Please try again in a moment.";
    }
}

export async function generateSubjectNotes(subjectName: string): Promise<string> {
    const ai = getGenAI();
    if (!ai) {
        return "AI service is not available. Please check the API key.";
    }
    const prompt = `Generate concise introductory study notes for the university-level subject: "${subjectName}". The notes should be easy to understand for an undergraduate student at Delhi Technological University. Structure the notes with:
1.  A brief introduction to the subject's importance.
2.  A list of 3-4 key fundamental topics or modules.
3.  A simple explanation or definition for each topic.
4.  A small, clear example for one of the topics to illustrate the concept.

Keep the tone academic but encouraging. Format the output for readability using Markdown, with clear headings (using double asterisks for bold, e.g., **Topic 1**), and bullet points (using a single asterisk *).`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error(`Error generating notes for ${subjectName}:`, error);
        return "Sorry, I couldn't generate the notes at this moment. Please try again later.";
    }
}