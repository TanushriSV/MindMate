package com.mindmate.app.ui.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mindmate.app.viewmodel.AppViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.mindmate.app.ui.components.BottomNav
import com.mindmate.app.ui.components.TopBar
import com.mindmate.app.ui.screens.auth.SignInScreen
import com.mindmate.app.ui.screens.auth.SignUpScreen
import com.mindmate.app.ui.screens.main.*
import com.mindmate.app.viewmodel.AuthViewModel

sealed class Screen(val route: String) {
    object SignIn : Screen("signin")
    object Home : Screen("home")
    object Explore : Screen("explore")
    object CheckIn : Screen("checkIn")
    object Chat : Screen("chat")
    object Profile : Screen("profile")
    object History : Screen("history")
    object JournalHome : Screen("journalHome")
    object Breathe : Screen("breathe")
}

@Composable
fun MainNavigation(
    authViewModel: AuthViewModel = viewModel(factory = AppViewModelProvider.Factory)
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Check token state for auto-login
    val authSuccess by authViewModel.authSuccess.collectAsState()
    
    LaunchedEffect(authSuccess) {
        if (!authSuccess && currentRoute != Screen.SignIn.route && currentRoute != "signup") {
            navController.navigate(Screen.SignIn.route) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    val bottomNavRoutes = listOf(
        Screen.Home.route,
        Screen.Explore.route,
        Screen.CheckIn.route,
        Screen.Chat.route,
        Screen.Profile.route
    )

    Scaffold(
        topBar = {
            if (currentRoute in bottomNavRoutes) {
                TopBar()
            }
        },
        bottomBar = {
            if (currentRoute in bottomNavRoutes) {
                BottomNav(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.SignIn.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.SignIn.route) {
                SignInScreen(
                    onNavigateToHome = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.SignIn.route) { inclusive = true }
                        }
                    }
                )
            }
            // Temporarily mapping "signup" to a hardcoded string as it's not in the Screen enum yet
            composable("signup") {
                SignUpScreen(
                    onNavigateToHome = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo("signup") { inclusive = true }
                        }
                    },
                    onNavigateToSignIn = {
                        navController.popBackStack()
                    }
                )
            }
            composable(Screen.Home.route) { HomeScreen() }
            composable(Screen.Explore.route) { ExploreScreen() }
            composable(Screen.CheckIn.route) { CheckInScreen() }
            composable(Screen.Chat.route) { ChatScreen() }
            composable(Screen.Profile.route) { 
                ProfileScreen(
                    onSignOutComplete = {
                        navController.navigate(Screen.SignIn.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                ) 
            }
            composable(Screen.History.route) { HistoryScreen() }
            composable(Screen.Breathe.route) { BreatheScreen() }
            composable(Screen.JournalHome.route) { 
                JournalHomeScreen(
                    onNavigateToEntry = {},
                    onNavigateToNew = {}
                )
            }
            composable("goalSetting") { GoalSettingScreen() }
            composable("detailedAnalytics") { DetailedAnalyticsScreen() }
            composable("sleepTracker") { SleepTrackerScreen() }
        }
    }
}


