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
import java.util.UUID

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
        if (password.length < 6) {
            _error.value = "Password must be at least 6 characters"
            return
        }
        
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                // Server requires ID to start with email_ + normalized email
                val safeId = "email_${email.lowercase().trim()}"
                // For plain login, we might not know the name. 
                // We will send a default or parse from email.
                val defaultName = email.substringBefore("@")
                repository.loginWithEmail(safeId, defaultName, email, password)
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
        if (password.length < 6) {
            _error.value = "Password must be at least 6 characters"
            return
        }
        
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                // Server uses unified token endpoint for registration too
                val safeId = "email_${email.lowercase().trim()}"
                repository.loginWithEmail(safeId, name, email, password)
                _authSuccess.value = true
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Registration failed"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun mockGoogleLogin() {
        // In a real app, you get a credential from Google Sign In. 
        // We will mock this to match dev server behavior.
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // To actually hit /api/auth/google, we need a real JWT token.
                // Since this is mock, let's just use email login to simulate it
                // if we don't have a valid google JWT. 
                // Or we can mock the server's google token if running in dev.
                // For now, let's just use a fake email login that creates a user.
                val fakeEmail = "google_${UUID.randomUUID().toString().take(6)}@gmail.com"
                repository.loginWithEmail("email_mock_google", "Google User", fakeEmail, "123456")
                _authSuccess.value = true
            } catch (e: Exception) {
                _error.value = "Mock Google Login failed"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun mockFacebookLogin() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val fakeEmail = "fb_${UUID.randomUUID().toString().take(6)}@facebook.com"
                repository.loginWithEmail("email_mock_fb", "Facebook User", fakeEmail, "123456")
                _authSuccess.value = true
            } catch (e: Exception) {
                _error.value = "Mock Facebook Login failed"
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

    fun resetRequest(email: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                repository.resetRequest(email)
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Failed to send reset email"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun resetConfirm(email: String, token: String, newPassword: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                repository.resetConfirm(email, token, newPassword)
            } catch (e: Exception) {
                _error.value = e.localizedMessage ?: "Failed to reset password"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
