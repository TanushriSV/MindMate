package com.mindmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindmate.app.data.network.TokenManager
import com.mindmate.app.data.repository.MindMateRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

class AuthViewModel constructor(
    private val repository: MindMateRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _authSuccess = MutableStateFlow(false)
    val authSuccess: StateFlow<Boolean> = _authSuccess.asStateFlow()

    init {
        viewModelScope.launch {
            val token = tokenManager.authToken.firstOrNull()
            if (!token.isNullOrBlank()) {
                _authSuccess.value = true
            }
        }
    }

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _error.value = "Email and password cannot be empty"
            return
        }
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                repository.loginWithEmail(email, password)
                _authSuccess.value = true
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Login failed"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun register(name: String, email: String, password: String) {
        if (name.isBlank() || email.isBlank() || password.isBlank()) {
            _error.value = "All fields are required"
            return
        }
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                repository.register(name, email, password)
                _authSuccess.value = true
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Registration failed"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.logout()
            _authSuccess.value = false
        }
    }

    fun clearError() {
        _error.value = null
    }
}
