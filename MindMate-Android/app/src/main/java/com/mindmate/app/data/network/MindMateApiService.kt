package com.mindmate.app.data.network

import com.mindmate.app.data.models.ChatMessage
import com.mindmate.app.data.models.MoodEntry
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface MindMateApiService {
    
    // Auth
    @POST("/api/auth/token")
    suspend fun loginWithEmail(@Body request: Map<String, String>): AuthResponse

    @POST("/api/auth/register")
    suspend fun register(@Body request: Map<String, String>): AuthResponse

    // Mood Entries
    @GET("/api/entries")
    suspend fun getEntries(): List<MoodEntry>

    @POST("/api/entries")
    suspend fun createEntry(@Body entry: MoodEntry): MoodEntry

    // Chat
    @GET("/api/chat/{sessionId}")
    suspend fun getChatHistory(@Path("sessionId") sessionId: String): List<ChatMessage>

    @POST("/api/chat/{sessionId}")
    suspend fun sendMessage(@Path("sessionId") sessionId: String, @Body message: ChatMessage): ChatMessage

    @GET("/api/daily-insight")
    suspend fun getDailyInsight(): InsightResponse
}

data class AuthResponse(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String?,
    val token: String
)

data class InsightResponse(val insight: String)
