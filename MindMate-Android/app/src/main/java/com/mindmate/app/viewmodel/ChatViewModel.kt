package com.mindmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindmate.app.data.models.ChatMessage
import com.mindmate.app.data.repository.MindMateRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ChatViewModel constructor(
    private val repository: MindMateRepository
) : ViewModel() {

    private val sessionId = "default_session" // Simplified for demo, usually passed via NavArgs

    private val _messages = MutableStateFlow<List<ChatMessage>>(
        listOf(ChatMessage("initial", "model", "Hello! I am MindMate. How are you feeling today?", System.currentTimeMillis()))
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val userMessage = ChatMessage(
            id = System.currentTimeMillis().toString(),
            role = "user",
            text = text,
            timestamp = System.currentTimeMillis()
        )
        
        // Optimistic update
        _messages.value = _messages.value + userMessage

        viewModelScope.launch {
            _isLoading.value = true
            try {
                // In full implementation, this calls repository.sendMessage
                // val response = repository.sendMessage(sessionId, userMessage)
                // _messages.value = _messages.value + response
                
                // Fallback simulation for offline testing
                kotlinx.coroutines.delay(1000)
                val aiResponse = ChatMessage(
                    id = (System.currentTimeMillis() + 1).toString(),
                    role = "model",
                    text = "I hear you. Tell me more about that.",
                    timestamp = System.currentTimeMillis() + 1000
                )
                _messages.value = _messages.value + aiResponse
            } catch (e: Exception) {
                // Handle error
                val errorMsg = ChatMessage(
                    id = System.currentTimeMillis().toString(),
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
