package com.mindmate.app.ui.screens.main

import androidx.compose.animation.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mindmate.app.data.models.MoodEntry
import java.util.UUID

@Composable
fun JournalEntryScreen(
    onComplete: (MoodEntry) -> Unit,
    onNavigateBack: () -> Unit
) {
    var step by remember { mutableStateOf("mood") } // mood, mode, guided, free, feedback
    var mood by remember { mutableStateOf("") }
    var guidedQ1 by remember { mutableStateOf("") }
    var guidedQ2 by remember { mutableStateOf("") }
    var guidedQ3 by remember { mutableStateOf("") }
    var freeContent by remember { mutableStateOf("") }
    var aiFeedback by remember { mutableStateOf("") }
    
    val handleSubmit = {
        val isGuided = step == "guided"
        val combinedContent = if (isGuided) {
            "1. What happened: $guidedQ1\n2. How it made me feel: $guidedQ2\n3. What I learned: $guidedQ3"
        } else {
            freeContent
        }
        
        // Mock AI feedback
        aiFeedback = "Thank you for reflecting today. Acknowledging your thoughts is a great step toward clarity."
        
        val entry = MoodEntry(
            id = UUID.randomUUID().toString(),
            mood = mood,
            timestamp = System.currentTimeMillis(),
            stressLevel = if (mood == "stressed") 8 else if (mood == "sad") 6 else if (mood == "happy") 2 else 5,
            anxietyLevel = if (mood == "stressed") "High" else "Low",
            note = combinedContent,
            stressIndicators = listOf("Journal", if (isGuided) "Guided" else "FreeFlow")
        )
        onComplete(entry)
        step = "feedback"
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = {
                if (step == "feedback") onNavigateBack()
                else if (step == "mood") onNavigateBack()
                else if (step == "mode") step = "mood"
                else step = "mode"
            }) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text("Reflection Chamber", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(24.dp))

        when (step) {
            "mood" -> {
                Text("How are you feeling right now?", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(24.dp))
                val moods = listOf("happy" to "😊", "neutral" to "😐", "sad" to "😔", "stressed" to "😫")
                moods.forEach { (m, e) ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clickable { mood = m; step = "mode" }) {
                        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(e, style = MaterialTheme.typography.headlineMedium)
                            Spacer(modifier = Modifier.width(16.dp))
                            Text(m.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
            }
            "mode" -> {
                Text("Choose your reflection style", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(24.dp))
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).clickable { step = "guided" }) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Edit, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(32.dp))
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text("Guided Reflection", fontWeight = FontWeight.Bold)
                            Text("Answer three simple prompts", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).clickable { step = "free" }) {
                    Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Edit, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(32.dp))
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text("Free Flow", fontWeight = FontWeight.Bold)
                            Text("An open canvas. Write whatever.", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
            "guided" -> {
                Text("Step 1: What happened today?", fontWeight = FontWeight.Bold)
                OutlinedTextField(value = guidedQ1, onValueChange = { guidedQ1 = it }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(16.dp))
                Text("Step 2: How did it make you feel?", fontWeight = FontWeight.Bold)
                OutlinedTextField(value = guidedQ2, onValueChange = { guidedQ2 = it }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(16.dp))
                Text("Step 3: What did you learn?", fontWeight = FontWeight.Bold)
                OutlinedTextField(value = guidedQ3, onValueChange = { guidedQ3 = it }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(24.dp))
                Button(onClick = handleSubmit, modifier = Modifier.fillMaxWidth()) { Text("Complete Reflection") }
            }
            "free" -> {
                OutlinedTextField(
                    value = freeContent, onValueChange = { freeContent = it },
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    placeholder = { Text("The page is yours. Pour your thoughts out...") }
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = handleSubmit, modifier = Modifier.fillMaxWidth()) { Text("Complete Reflection") }
            }
            "feedback" -> {
                Text("Reflection Saved", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(24.dp))
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Text("\"$aiFeedback\"", modifier = Modifier.padding(16.dp), fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                }
                Spacer(modifier = Modifier.height(32.dp))
                Button(onClick = onNavigateBack, modifier = Modifier.fillMaxWidth()) { Text("Return to Home") }
            }
        }
    }
}
