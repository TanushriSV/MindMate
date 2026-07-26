package com.mindmate.app.data.repository

import com.mindmate.app.data.models.*
import com.mindmate.app.data.network.MindMateApiService
import com.mindmate.app.data.network.TokenManager

class MindMateRepository constructor(
    private val apiService: MindMateApiService,
    private val tokenManager: TokenManager
) {
    suspend fun loginWithEmail(id: String, name: String, email: String, password: String) {
        // According to server.ts, ID must start with "email_" for email logins in production,
        // but id can be anything. We will prefix in ViewModel.
        val request = AuthTokenRequest(
            id = id,
            name = name,
            email = email,
            password = password,
            avatar = null
        )
        val response = apiService.loginWithEmail(request)
        tokenManager.saveToken(response.token)
    }

    suspend fun loginWithGoogle(id: String, token: String) {
        val response = apiService.loginWithGoogle(AuthSocialRequest(credential = token))
        tokenManager.saveToken(response.token)
    }

    suspend fun loginWithFacebook(token: String) {
        val response = apiService.loginWithFacebook(AuthSocialRequest(accessToken = token))
        tokenManager.saveToken(response.token)
    }
    
    suspend fun resetRequest(email: String) = apiService.resetRequest(mapOf("email" to email))
    
    suspend fun resetConfirm(email: String, token: String, newPassword: String) = 
        apiService.resetConfirm(mapOf("email" to email, "token" to token, "newPassword" to newPassword))

    suspend fun logout() {
        tokenManager.clearToken()
    }

    suspend fun getUserProfile() = apiService.getUserProfile()
    
    suspend fun updateUserProfile(name: String?, avatar: String?) = 
        apiService.updateUserProfile(
            buildMap {
                name?.let { put("name", it) }
                avatar?.let { put("avatar", it) }
            }
        )
        
    suspend fun deleteAccount() = apiService.deleteAccount()

    suspend fun getEntries() = apiService.getEntries()

    suspend fun createEntry(entry: MoodEntry) = apiService.createEntry(entry)

    suspend fun deleteAllEntries() = apiService.deleteAllEntries()
    
    suspend fun deleteEntry(id: String) = apiService.deleteEntry(id)

    suspend fun getChatSessions() = apiService.getChatSessions()
    
    suspend fun createChatSession(title: String? = null) = apiService.createChatSession(SessionCreateRequest(title))
    
    suspend fun updateChatSession(id: String, title: String) = apiService.updateChatSession(id, SessionCreateRequest(title))
    
    suspend fun deleteChatSession(id: String) = apiService.deleteChatSession(id)

    suspend fun getChatHistory(sessionId: String?) = apiService.getChatHistory(sessionId)

    suspend fun saveChatMessage(request: ChatSaveRequest) = apiService.saveChatMessage(request)

    suspend fun sendMessage(request: ChatRequest) = apiService.sendMessage(request)

    suspend fun getDailyInsight() = apiService.getDailyInsight()
    
    suspend fun checkHealth() = apiService.checkHealth()
}
