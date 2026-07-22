package com.mindmate.app.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun GoalSettingScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Your Goals", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        
        Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
            Text("No active goals found.")
        }
        
        Button(
            onClick = { /* Create Goal */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Add New Goal")
        }
    }
}
