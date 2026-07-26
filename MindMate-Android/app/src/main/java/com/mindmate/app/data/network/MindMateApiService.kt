package com.mindmate.app.data.network

import com.mindmate.app.data.models.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.DELETE
import retrofit2.http.Path
import retrofit2.http.Query

interface MindMateApiService {
    
    // Auth
    @POST("/api/auth/token")
    suspend fun loginWithEmail(@Body request: AuthTokenRequest): AuthResponse

    @POST("/api/auth/refresh")
    suspend fun refreshToken(): TokenRefreshResponse

    @POST("/api/auth/reset-request")
    suspend fun resetRequest(@Body request: Map<String, String>): SuccessResponse

    @POST("/api/auth/reset-confirm")
    suspend fun resetConfirm(@Body request: Map<String, String>): SuccessResponse

    @POST("/api/auth/google")
    suspend fun loginWithGoogle(@Body request: AuthSocialRequest): AuthResponse

    @POST("/api/auth/facebook")
    suspend fun loginWithFacebook(@Body request: AuthSocialRequest): AuthResponse

    // User
    @GET("/api/user/profile")
    suspend fun getUserProfile(): UserProfileResponse

    @POST("/api/user/profile")
    suspend fun updateUserProfile(@Body request: Map<String, String>): UserProfileResponse

    @DELETE("/api/user/account")
    suspend fun deleteAccount(): SuccessResponse

    // Mood Entries
    @GET("/api/entries")
    suspend fun getEntries(): List<MoodEntry>

    @POST("/api/entries")
    suspend fun createEntry(@Body entry: MoodEntry): SuccessResponse

    @DELETE("/api/entries/all")
    suspend fun deleteAllEntries(): SuccessResponse

    @DELETE("/api/entries/{id}")
    suspend fun deleteEntry(@Path("id") id: String): SuccessResponse

    // Chat Sessions
    @GET("/api/chat/sessions")
    suspend fun getChatSessions(): List<ChatSession>

    @POST("/api/chat/sessions")
    suspend fun createChatSession(@Body request: SessionCreateRequest): ChatSession

    @PUT("/api/chat/sessions/{id}")
    suspend fun updateChatSession(@Path("id") id: String, @Body request: SessionCreateRequest): SuccessResponse

    @DELETE("/api/chat/sessions/{id}")
    suspend fun deleteChatSession(@Path("id") id: String): SuccessResponse

    // Chat History
    @GET("/api/chat/history")
    suspend fun getChatHistory(@Query("sessionId") sessionId: String?): ChatHistoryResponse

    @POST("/api/chat/save")
    suspend fun saveChatMessage(@Body request: ChatSaveRequest): ChatSaveResponse

    @POST("/api/chat")
    suspend fun sendMessage(@Body request: ChatRequest): ChatResponse

    @GET("/api/daily-insight")
    suspend fun getDailyInsight(): InsightResponse

    @GET("/health")
    suspend fun checkHealth(): HealthResponse
}

data class AuthResponse(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String?,
    val joinDate: Long,
    val token: String
)

data class InsightResponse(val text: String)

data class HealthResponse(
    val status: String,
    val db: String
)
