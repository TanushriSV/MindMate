package com.mindmate.app.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun JournalHomeScreen(onNavigateToEntry: (String) -> Unit, onNavigateToNew: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Journal", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
            Text("No journal entries yet.")
        }

        FloatingActionButton(
            onClick = onNavigateToNew,
            modifier = Modifier.align(Alignment.End).padding(16.dp)
        ) {
            Text("+")
        }
    }
}
