package com.mindmate.app.viewmodel

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.mindmate.app.MindMateApplication

object AppViewModelProvider {
    val Factory = viewModelFactory {
        initializer {
            AuthViewModel(
                mindMateApplication().container.mindMateRepository,
                mindMateApplication().container.tokenManager
            )
        }
        initializer {
            ChatViewModel(
                mindMateApplication().container.mindMateRepository
            )
        }
        initializer {
            MainViewModel(
                mindMateApplication().container.mindMateRepository
            )
        }
    }
}

fun CreationExtras.mindMateApplication(): MindMateApplication =
    (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as MindMateApplication)
