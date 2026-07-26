package com.mindmate.app.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SleepTrackerScreen() {
    var hoursSlept by remember { mutableFloatStateOf(7f) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Sleep Tracker", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(32.dp))
        
        Text("Hours Slept: ${hoursSlept.toInt()} hrs", style = MaterialTheme.typography.titleMedium)
        Slider(
            value = hoursSlept,
            onValueChange = { hoursSlept = it },
            valueRange = 0f..14f,
            steps = 13,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(32.dp))
        Text("Sleep Quality")
        Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Button(onClick = { /* Set */ }) { Text("Poor") }
            Button(onClick = { /* Set */ }) { Text("Fair") }
            Button(onClick = { /* Set */ }) { Text("Good") }
        }

        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = { /* Save Sleep */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Log Sleep")
        }
    }
}
