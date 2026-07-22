package com.mindmate.app.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun BreatheScreen() {
    var isBreathing by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Breathe", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(64.dp))
        
        Surface(
            modifier = Modifier.size(200.dp),
            shape = androidx.compose.foundation.shape.CircleShape,
            color = if (isBreathing) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.secondaryContainer
        ) {
            Box(contentAlignment = androidx.compose.ui.Alignment.Center) {
                Text(if (isBreathing) "Inhale..." else "Exhale...")
            }
        }

        Spacer(modifier = Modifier.height(64.dp))
        Button(onClick = { isBreathing = !isBreathing }) {
            Text(if (isBreathing) "Stop" else "Start")
        }
    }
}
