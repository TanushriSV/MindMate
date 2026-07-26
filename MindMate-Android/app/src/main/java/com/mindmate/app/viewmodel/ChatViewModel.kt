package com.mindmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindmate.app.data.models.ChatMessage
import com.mindmate.app.data.models.ChatRequest
import com.mindmate.app.data.models.ChatHistoryPart
import com.mindmate.app.data.models.ChatTextPart
import com.mindmate.app.data.models.ChatSaveRequest
import com.mindmate.app.data.repository.MindMateRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class ChatViewModel constructor(
    private val repository: MindMateRepository
) : ViewModel() {

    private var currentSessionId: String? = null

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadHistory()
    }

    private fun loadHistory() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // Fetch latest session history or create a new session if none exists
                val historyResponse = repository.getChatHistory(null)
                currentSessionId = historyResponse.sessionId
                _messages.value = historyResponse.messages
            } catch (e: Exception) {
                // If it fails, maybe start with a default message
                _messages.value = listOf(
                    ChatMessage(
                        id = UUID.randomUUID().toString(),
                        role = "model",
                        text = "Hello! I am MindMate. How are you feeling today?",
                        timestamp = System.currentTimeMillis()
                    )
                )
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val userMessage = ChatMessage(
            id = UUID.randomUUID().toString(),
            role = "user",
            text = text,
            timestamp = System.currentTimeMillis()
        )
        
        // Optimistic update
        _messages.value = _messages.value + userMessage

        viewModelScope.launch {
            _isLoading.value = true
            try {
                // Save user message to DB
                val saveResponse = repository.saveChatMessage(
                    ChatSaveRequest(
                        id = userMessage.id,
                        role = "user",
                        text = userMessage.text,
                        timestamp = userMessage.timestamp,
                        sessionId = currentSessionId
                    )
                )
                
                if (saveResponse.success) {
                    currentSessionId = saveResponse.sessionId
                }

                // Call AI
                val historyForApi = _messages.value.map { msg ->
                    ChatHistoryPart(
                        role = msg.role,
                        parts = listOf(ChatTextPart(msg.text))
                    )
                }

                val aiResponse = repository.sendMessage(ChatRequest(history = historyForApi))
                
                val modelMessage = ChatMessage(
                    id = UUID.randomUUID().toString(),
                    role = "model",
                    text = aiResponse.text,
                    timestamp = System.currentTimeMillis()
                )
                
                _messages.value = _messages.value + modelMessage
                
                // Save AI message to DB
                repository.saveChatMessage(
                    ChatSaveRequest(
                        id = modelMessage.id,
                        role = "model",
                        text = modelMessage.text,
                        timestamp = modelMessage.timestamp,
                        sessionId = currentSessionId
                    )
                )
                
            } catch (e: Exception) {
                val errorMsg = ChatMessage(
                    id = UUID.randomUUID().toString(),
                    role = "model",
                    text = "I'm having trouble connecting right now. Please try again.",
                    timestamp = System.currentTimeMillis()
                )
                _messages.value = _messages.value + errorMsg
            } finally {
                _isLoading.value = false
            }
        }
    }
}
