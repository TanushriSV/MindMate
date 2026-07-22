package com.mindmate.app.data.models

data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatar: String?,
    val token: String?
)

data class MoodEntry(
    val id: String,
    val mood: String,
    val timestamp: Long,
    val note: String? = null,
    val stressLevel: Int? = null,
    val sleepQuality: String? = null,
    val tags: List<String>? = null,
    val anxietyScore: Int? = null,
    val anxietyLevel: String? = null,
    val stressIndicators: List<String>? = null,
    val aiFeedback: String? = null,
    val journalMode: String? = null
)

data class ChatMessage(
    val id: String,
    val role: String,
    val text: String,
    val timestamp: Long
)
