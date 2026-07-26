package com.mindmate.app.ui.screens.main

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mindmate.app.data.models.MoodEntry
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckInScreen(
    onComplete: (MoodEntry) -> Unit,
    onCancel: () -> Unit
) {
    var step by remember { mutableStateOf(1) }

    var mood by remember { mutableStateOf("calm") }
    var stressIndicators by remember { mutableStateOf(setOf<String>()) }
    var anxietyWorry by remember { mutableStateOf(1f) }
    var anxietyRelax by remember { mutableStateOf(1f) }
    var stressLevel by remember { mutableStateOf(4f) }
    var sleepQuality by remember { mutableStateOf("fair") }
    var note by remember { mutableStateOf("") }

    val calculatedAnxietyScore = anxietyWorry.toInt() + anxietyRelax.toInt()
    val riskLevel = when {
        calculatedAnxietyScore >= 5 || stressLevel >= 8 -> "High"
        calculatedAnxietyScore >= 3 || stressLevel >= 5 -> "Moderate"
        else -> "Low"
    }

    val handleFinish = {
        val entry = MoodEntry(
            id = UUID.randomUUID().toString(),
            mood = mood,
            timestamp = System.currentTimeMillis(),
            stressLevel = stressLevel.toInt(),
            sleepQuality = sleepQuality,
            anxietyScore = calculatedAnxietyScore,
            anxietyLevel = riskLevel,
            stressIndicators = stressIndicators.toList(),
            note = note
        )
        onComplete(entry)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = {
                if (step == 1) onCancel() else step -= 1
            }) {
                Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(if (step == 1) "Cancel" else "Back")
            }

            if (step < 6) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (step >= 2) {
                        TextButton(onClick = handleFinish) {
                            Text("Save & exit", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text(
                            "Step $step of 5",
                            style = MaterialTheme.typography.labelSmall,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Box(modifier = Modifier.weight(1f)) {
            when (step) {
                1 -> StepMood(mood) { mood = it }
                2 -> StepIndicators(stressIndicators) { if (stressIndicators.contains(it)) stressIndicators -= it else stressIndicators += it }
                3 -> StepAnxiety(anxietyWorry, anxietyRelax, { anxietyWorry = it }, { anxietyRelax = it })
                4 -> StepStress(stressLevel) { stressLevel = it }
                5 -> StepSleep(sleepQuality, note, { sleepQuality = it }, { note = it })
                6 -> StepResults(mood, stressLevel.toInt(), sleepQuality, stressIndicators, calculatedAnxietyScore, riskLevel, note)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Footer Action
        Button(
            onClick = {
                if (step < 6) step += 1 else handleFinish()
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .padding(horizontal = 24.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text(
                when (step) {
                    in 1..4 -> "Continue Check-in"
                    5 -> "Generate Life Evaluation"
                    else -> "Save to Sanctuary History"
                },
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.width(8.dp))
            Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
        }
    }
}

@Composable
fun StepMood(current: String, onSelect: (String) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Text("How are you feeling?", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        val moods = listOf(
            "happy" to "😊",
            "calm" to "😌",
            "neutral" to "😐",
            "sad" to "😔",
            "stressed" to "😫"
        )
        moods.forEach { (id, emoji) ->
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { onSelect(id) },
                shape = RoundedCornerShape(12.dp),
                color = if (current == id) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                border = if (current == id) androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(emoji, style = MaterialTheme.typography.headlineMedium)
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(id.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun StepIndicators(selected: Set<String>, onToggle: (String) -> Unit) {
    val options = listOf("Headache", "Muscle Tension", "Racing Heart", "Fatigue", "Irritability")
    Column {
        Text("Any physical indicators?", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        options.forEach { opt ->
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().clickable { onToggle(opt) }.padding(vertical = 8.dp)) {
                Checkbox(checked = selected.contains(opt), onCheckedChange = { onToggle(opt) })
                Text(opt, style = MaterialTheme.typography.bodyLarge)
            }
        }
    }
}

@Composable
fun StepAnxiety(worry: Float, relax: Float, onWorry: (Float) -> Unit, onRelax: (Float) -> Unit) {
    Column {
        Text("Anxiety Assessment", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("Not being able to stop or control worrying", fontWeight = FontWeight.Bold)
        Slider(value = worry, onValueChange = onWorry, valueRange = 0f..3f, steps = 2)
        Text("Value: ${worry.toInt()} (0=Not at all, 3=Nearly every day)")

        Spacer(modifier = Modifier.height(24.dp))

        Text("Trouble relaxing", fontWeight = FontWeight.Bold)
        Slider(value = relax, onValueChange = onRelax, valueRange = 0f..3f, steps = 2)
        Text("Value: ${relax.toInt()} (0=Not at all, 3=Nearly every day)")
    }
}

@Composable
fun StepStress(level: Float, onLevel: (Float) -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Text("Overall Stress Level", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        Text(level.toInt().toString(), style = MaterialTheme.typography.displayLarge, color = MaterialTheme.colorScheme.primary)
        Slider(value = level, onValueChange = onLevel, valueRange = 1f..10f, steps = 8, modifier = Modifier.fillMaxWidth())
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Low")
            Text("High")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StepSleep(quality: String, note: String, onQuality: (String) -> Unit, onNote: (String) -> Unit) {
    Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
        Text("Sleep & Notes", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("How did you sleep?", fontWeight = FontWeight.Bold)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
            listOf("restorative", "fair", "restless").forEach { q ->
                FilterChip(
                    selected = quality == q,
                    onClick = { onQuality(q) },
                    label = { Text(q.replaceFirstChar { it.uppercase() }) }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Any other notes?", fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = note,
            onValueChange = onNote,
            modifier = Modifier.fillMaxWidth().height(150.dp).padding(top = 8.dp),
            placeholder = { Text("Write your thoughts...") }
        )
    }
}

@Composable
fun StepResults(
    mood: String, stressLevel: Int, sleepQuality: String,
    stressIndicators: Set<String>, anxietyScore: Int, riskLevel: String, note: String
) {
    Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
        Text("Your Check-in Results", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        
        Card(modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Mood: $mood", style = MaterialTheme.typography.titleMedium)
                Text("Stress Level: $stressLevel / 10", style = MaterialTheme.typography.titleMedium)
                Text("Sleep: $sleepQuality", style = MaterialTheme.typography.titleMedium)
            }
        }

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = if (riskLevel == "High") MaterialTheme.colorScheme.errorContainer else MaterialTheme.colorScheme.primaryContainer)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Anxiety Risk Level: $riskLevel", fontWeight = FontWeight.Bold)
                Text("Calculated Score: $anxietyScore")
            }
        }
        
        if (stressIndicators.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            Text("Indicators: ${stressIndicators.joinToString()}", style = MaterialTheme.typography.bodyMedium)
        }

        if (note.isNotBlank()) {
            Spacer(modifier = Modifier.height(16.dp))
            Text("Notes:", fontWeight = FontWeight.Bold)
            Text(note)
        }
    }
}
