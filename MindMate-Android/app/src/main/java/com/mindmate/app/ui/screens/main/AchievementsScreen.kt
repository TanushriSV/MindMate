package com.mindmate.app.ui.screens.main

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mindmate.app.data.models.MoodEntry
import java.util.Calendar

data class AchievementBadge(
    val id: String,
    val title: String,
    val description: String,
    val unlocked: Boolean,
    val color: Color,
    val progress: Int,
    val total: Int
)

fun computeStreak(entries: List<MoodEntry>): Int {
    if (entries.isEmpty()) return 0
    val sorted = entries.sortedByDescending { it.timestamp }
    var streak = 0
    var currentDate = Calendar.getInstance().apply { 
        timeInMillis = sorted.first().timestamp
        set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    for (entry in sorted) {
        val entryDate = Calendar.getInstance().apply {
            timeInMillis = entry.timestamp
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        
        val diffDays = (currentDate - entryDate) / (1000 * 60 * 60 * 24)
        if (diffDays == 0L) {
            // same day, continue
            if (streak == 0) streak = 1
        } else if (diffDays == 1L) {
            streak++
            currentDate = entryDate
        } else {
            break
        }
    }
    return streak
}

@Composable
fun AchievementsScreen(
    entries: List<MoodEntry>,
    onNavigateBack: () -> Unit
) {
    val totalEntries = entries.size
    val streak = computeStreak(entries)

    val achievements = listOf(
        AchievementBadge("first_step", "First Step", "Log your first wellness check-in", totalEntries >= 1, Color(0xFF10B981), minOf(totalEntries, 1), 1),
        AchievementBadge("streak_3", "Consistency", "Maintain a 3-day check-in streak", streak >= 3, Color(0xFFF97316), minOf(streak, 3), 3),
        AchievementBadge("reflection_master", "Self-Aware", "Complete 10 total evaluations", totalEntries >= 10, Color(0xFFEC4899), minOf(totalEntries, 10), 10),
        AchievementBadge("resilience", "Inner Resilience", "Maintain a 7-day check-in streak", streak >= 7, Color(0xFF3B82F6), minOf(streak, 7), 7),
        AchievementBadge("zen_master", "Zen Master", "Log a \"Calm\" mood 5 times", entries.count { it.mood == "calm" } >= 5, Color(0xFFA855F7), minOf(entries.count { it.mood == "calm" }, 5), 5),
        AchievementBadge("energy_boost", "Energy Shift", "Complete 25 total evaluations", totalEntries >= 25, Color(0xFFF59E0B), minOf(totalEntries, 25), 25)
    )

    val unlockedCount = achievements.count { it.unlocked }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text("Achievements", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black)
                    Text("Unlock badges on your wellness journey.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Surface(
                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
            ) {
                Text("$unlockedCount / ${achievements.size}", modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
            }
        }

        LazyVerticalGrid(
            columns = GridCells.Fixed(1),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(achievements) { badge ->
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (badge.unlocked) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surface
                    ),
                    shape = RoundedCornerShape(24.dp),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))
                ) {
                    Row(modifier = Modifier.padding(16.dp).fillMaxWidth()) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .background(if (badge.unlocked) badge.color else MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Star, contentDescription = null, tint = if (badge.unlocked) Color.White else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f))
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(badge.title, fontWeight = FontWeight.Bold, color = if (badge.unlocked) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(badge.description, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(bottom = 8.dp))
                            
                            Box(modifier = Modifier.fillMaxWidth().height(8.dp).background(MaterialTheme.colorScheme.surfaceVariant, CircleShape)) {
                                Box(modifier = Modifier.fillMaxWidth(badge.progress.toFloat() / badge.total).fillMaxHeight().background(if (badge.unlocked) badge.color else MaterialTheme.colorScheme.primary, CircleShape))
                            }
                            Row(modifier = Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("${badge.progress} / ${badge.total}", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                if (badge.unlocked) {
                                    Text("Unlocked", fontSize = 10.sp, color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
