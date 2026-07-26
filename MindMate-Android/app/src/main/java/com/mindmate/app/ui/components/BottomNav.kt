package com.mindmate.app.ui.components

import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector

data class BottomNavItem(
    val name: String,
    val route: String
    // In a real app we'd use icons from material-icons-extended, 
    // omitting for brevity to ensure it compiles without extra deps
)

@Composable
fun BottomNav(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    val items = listOf(
        BottomNavItem("Home", "home"),
        BottomNavItem("Explore", "explore"),
        BottomNavItem("Check-In", "checkIn"),
        BottomNavItem("Chat", "chat"),
        BottomNavItem("Profile", "profile")
    )

    NavigationBar {
        items.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(item.route) },
                icon = { Text(item.name.first().toString()) },
                label = { Text(item.name) }
            )
        }
    }
}
