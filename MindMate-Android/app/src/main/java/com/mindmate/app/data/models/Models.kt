package com.mindmate.app.data.models

data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String?,
    val joinDate: Long? = null,
    val token: String? = null
)

data class AuthTokenRequest(
    val id: String,
    val name: String,
    val email: String,
    val password: String?,
    val avatar: String?
)

data class AuthSocialRequest(
    val credential: String? = null, // for google
    val accessToken: String? = null // for facebook
)

data class UserProfileResponse(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String?,
    val joinDate: Long
)

data class MoodEntry(
    val id: String,
    val mood: String,
    val timestamp: Long,
    val stressLevel: Int? = null,
    val sleepQuality: String? = null,
    val anxietyScore: Int? = null,
    val anxietyLevel: String? = null,
    val stressIndicators: List<String>? = null,
    val note: String? = null
)

data class ChatMessage(
    val id: String,
    val role: String,
    val text: String,
    val timestamp: Long
)

data class ChatSession(
    val id: String,
    val user_id: String,
    val title: String,
    val created_at: Long
)

data class ChatHistoryResponse(
    val sessionId: String?,
    val messages: List<ChatMessage>
)

data class ChatSaveRequest(
    val id: String,
    val role: String,
    val text: String,
    val timestamp: Long,
    val sessionId: String?
)

data class ChatSaveResponse(
    val success: Boolean,
    val sessionId: String
)

data class ChatRequest(
    val history: List<ChatHistoryPart>,
    val userState: UserState? = null
)

data class ChatHistoryPart(
    val role: String,
    val parts: List<ChatTextPart>
)

data class ChatTextPart(
    val text: String
)

data class ChatResponse(
    val text: String
)

data class UserState(
    val name: String?,
    val recentMoodSliderScores: MoodScores?,
    val somaticIndicators: List<String>?
)

data class MoodScores(
    val stressLevel: Int?,
    val anxietyScore: Int?
)

data class SuccessResponse(
    val success: Boolean,
    val message: String? = null
)

data class TokenRefreshResponse(
    val token: String,
    val refreshed: Boolean,
    val expiresAt: Long
)

data class SessionCreateRequest(
    val title: String?
)
