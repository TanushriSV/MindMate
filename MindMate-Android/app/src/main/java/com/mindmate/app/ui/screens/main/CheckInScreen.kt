package com.mindmate.app.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mindmate.app.viewmodel.AppViewModelProvider
import com.mindmate.app.data.models.MoodEntry
import com.mindmate.app.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckInScreen(
    viewModel: MainViewModel = viewModel(factory = AppViewModelProvider.Factory)
) {
    var selectedMood by remember { mutableStateOf<String?>(null) }
    var stressLevel by remember { mutableFloatStateOf(5f) }
    
    val moods = listOf("calm", "happy", "neutral", "sad", "stressed", "thoughtful", "tired", "low")

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Daily Check-In", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(32.dp))
        
        Text("How are you feeling?", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(16.dp))
        
        // Wrap moods in rows to fit screen
        val chunkedMoods = moods.chunked(4)
        chunkedMoods.forEach { rowMoods ->
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                rowMoods.forEach { mood ->
                    FilterChip(
                        selected = selectedMood == mood,
                        onClick = { selectedMood = mood },
                        label = { Text(mood.replaceFirstChar { it.uppercase() }) }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
        Text("Stress Level: ${stressLevel.toInt()}", style = MaterialTheme.typography.titleMedium)
        Slider(
            value = stressLevel,
            onValueChange = { stressLevel = it },
            valueRange = 1f..10f,
            steps = 8,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.weight(1f))
        
        Button(
            onClick = {
                if (selectedMood != null) {
                    val entry = MoodEntry(
                        id = System.currentTimeMillis().toString(),
                        mood = selectedMood!!,
                        timestamp = System.currentTimeMillis(),
                        stressLevel = stressLevel.toInt()
                    )
                    viewModel.addEntry(entry)
                    // Reset or show success
                    selectedMood = null
                    stressLevel = 5f
                }
            },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            enabled = selectedMood != null
        ) {
            Text("Save Check-In")
        }
    }
}

