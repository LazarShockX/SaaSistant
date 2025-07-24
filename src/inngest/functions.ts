import JSONL from "jsonl-parse-stringify";

import { inngest } from "@/inngest/client";
import { createAgent, openai, TextMessage } from "@inngest/agent-kit";

import { StreamTranscriptItem } from "@/modules/meetings/types";
import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const summarizer = createAgent({
    name: "summarizer",
    system: `
        You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

        Use the following markdown structure for every output:

        ### Overview
        Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

        ### Notes
        Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

        Example:
        #### Section Name
        - Main point or demo shown here
        - Another key insight or interaction
        - Follow-up tool or explanation provided

        #### Next Section
        - Feature X automatically does Y
        - Mention of integration with Z
    `.trim(),
    model: openai({
        model: "gpt-4o",
        apiKey: process.env.OPENAI_API_KEY,
    })
})

export const meetingsProcessing = inngest.createFunction(
  { 
    id: "meetings/processing",
    retries: 0  // Disable retries to prevent getting stuck
  },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    const response = await step.run("fetch-transcript", async () => {
        return fetch(event.data.transcriptUrl).then((res) => res.text());
    })

    const transcript = await step.run("parse-transcript", async () => {
        return JSONL.parse<StreamTranscriptItem>(response);
    })

    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
        const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))]; // Get both user and agent speaker IDs from transcript

        const userSpeakers = await db
            .select()
            .from(user)
            .where(inArray(user.id, speakerIds))
            .then((users) =>
                users.map((user) => ({
                    ...user // Redundant spread, but ensures immutability
                }))
            )
        
        const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
            agents.map((agent) => ({
                ...agent
            }))
        )

        const speakers = [...userSpeakers, ...agentSpeakers]; // Combine user and agent speakers

        return transcript.map((item) => {
            const speaker = speakers.find((speaker) => speaker.id === item.speaker_id); // For each transcript item, find the corresponding speaker (agent or you), i.e. "agent123" === "agent123" will return the agent object

            if (!speaker) {
                return {
                    ...item, // Return existing item
                    user: {
                        name: "Unknown",
                    }
                }
            }

            return {
                ...item,
                user: {
                    name: speaker.name, // Also return speaker's (agent or you) name in a user object
                }
            }
        })
    })

    try {
        const { output } = await summarizer.run("Summarize the following transcript: " + JSON.stringify(transcriptWithSpeakers));

        await step.run("save-summary", async () => {
            await db
                .update(meetings)
                .set({
                    summary: (output[0] as TextMessage).content as string,
                    status: "completed",
                })
                .where(eq(meetings.id, event.data.meetingId));
        })
    } catch (error: unknown) {
        // Check if it's a 429 (rate limit) error - checking multiple possible formats
        const errorString = error?.toString() || '';
        const errorMessage = (error as Error)?.message || '';
        
        // Type-safe way to check for error properties
        const hasStatus = error && typeof error === 'object' && 'status' in error;
        const hasCode = error && typeof error === 'object' && 'code' in error;
        const hasStatusCode = error && typeof error === 'object' && 'statusCode' in error;
        
        const is429Error = (hasStatus && (error as { status: number }).status === 429) || 
            (hasCode && (error as { code: number }).code === 429) || 
            (hasStatusCode && (error as { statusCode: number }).statusCode === 429) ||
            errorMessage.includes('429') ||
            errorString.includes('429') ||
            errorMessage.includes('unsuccessful status code: 429') ||
            errorString.includes('unsuccessful status code: 429') ||
            errorMessage.includes('rate limit') ||
            errorString.includes('rate limit');
        
        if (is429Error) {
            console.log('Detected 429 error, setting meeting to completed');
            
            await step.run("save-rate-limited", async () => {
                await db
                    .update(meetings)
                    .set({
                        summary: "Summary unavailable due to rate limiting. Please try again later.",
                        status: "completed",
                    })
                    .where(eq(meetings.id, event.data.meetingId));
            })
        } else {
            // For any other error, also complete the meeting to prevent getting stuck
            console.log('Unknown error type, setting meeting to completed to prevent stuck state');
            
            await step.run("save-error", async () => {
                await db
                    .update(meetings)
                    .set({
                        summary: "Summary unavailable due to an error during processing.",
                        status: "completed",
                    })
                    .where(eq(meetings.id, event.data.meetingId));
            })
        }
    }
  },
);
