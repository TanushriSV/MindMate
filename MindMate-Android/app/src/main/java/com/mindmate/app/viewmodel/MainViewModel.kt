package com.mindmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindmate.app.data.models.MoodEntry
import com.mindmate.app.data.repository.MindMateRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel constructor(
    private val repository: MindMateRepository
) : ViewModel() {

    private val _entries = MutableStateFlow<List<MoodEntry>>(emptyList())
    val entries: StateFlow<List<MoodEntry>> = _entries.asStateFlow()

    private val _dailyInsight = MutableStateFlow("Take a deep breath and center yourself.")
    val dailyInsight: StateFlow<String> = _dailyInsight.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadData() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                // Fetch entries
                // _entries.value = repository.getEntries()
                
                // Fetch daily insight
                // _dailyInsight.value = repository.getDailyInsight().insight
            } catch (e: Exception) {
                _error.value = e.message ?: "An unknown error occurred"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun addEntry(entry: MoodEntry) {
        viewModelScope.launch {
            try {
                // val created = repository.createEntry(entry)
                // _entries.value = _entries.value + created
                _entries.value = _entries.value + entry
            } catch (e: Exception) {
                _error.value = "Failed to add entry"
            }
        }
    }
}
