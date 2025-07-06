import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { CHAT_WITH_SAVI, CHAT_WITH_SAVI_CLEAR, CHAT_WITH_SAVI_HISTORY } from "src/environments/environment";
import { ChatMessage, ChatRequest, ChatResponse } from "../model/ai-advice.model";
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiAssistantService {

    constructor(
        private http: HttpClient
    ) {}

    async chatWithSavi(message: ChatRequest): Promise<ChatResponse> {
        try {
            const response = await firstValueFrom(
                this.http.post<ChatResponse>(CHAT_WITH_SAVI, message)
            );

            if (!response) {
                throw new Error('Empty response from server');
            }

            return response;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getChatHistory(offset: number, limit: number): Promise<ChatMessage[]> {
        try {
            const history = await firstValueFrom(
                this.http.get<any[]>(`${CHAT_WITH_SAVI_HISTORY}?offset=${offset}&limit=${limit}`)
            );

            if (!history) {
                throw new Error('Empty response from server');
            }

            return history.flatMap(h => [
                { role: 'user', content: h.userMessage },
                { role: 'assistant', content: h.assistantResponse }
            ]);
        } catch (error) {
            throw error;
        }
    } 

    async clearChatHistory(): Promise<void> {
        try {
            await firstValueFrom(this.http.delete<void>(CHAT_WITH_SAVI_CLEAR));
        } catch (error) {
            throw error;
        }
    }
}