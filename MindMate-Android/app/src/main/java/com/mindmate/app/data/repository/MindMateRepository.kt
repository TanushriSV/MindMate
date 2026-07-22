package com.mindmate.app.data.repository

import com.mindmate.app.data.models.ChatMessage
import com.mindmate.app.data.models.MoodEntry
import com.mindmate.app.data.network.MindMateApiService
import com.mindmate.app.data.network.TokenManager

class MindMateRepository constructor(
    private val apiService: MindMateApiService,
    private val tokenManager: TokenManager
) {
    suspend fun loginWithEmail(email: String, password: String) {
        val response = apiService.loginWithEmail(mapOf("email" to email, "password" to password))
        tokenManager.saveToken(response.token)
    }

    suspend fun register(name: String, email: String, password: String) {
        val response = apiService.register(mapOf("name" to name, "email" to email, "password" to password))
        tokenManager.saveToken(response.token)
    }

    suspend fun logout() {
        tokenManager.clearToken()
    }

    suspend fun getEntries() = apiService.getEntries()

    suspend fun createEntry(entry: MoodEntry) = apiService.createEntry(entry)

    suspend fun getChatHistory(sessionId: String) = apiService.getChatHistory(sessionId)

    suspend fun sendMessage(sessionId: String, message: ChatMessage) = 
        apiService.sendMessage(sessionId, message)

    suspend fun getDailyInsight() = apiService.getDailyInsight()
}
