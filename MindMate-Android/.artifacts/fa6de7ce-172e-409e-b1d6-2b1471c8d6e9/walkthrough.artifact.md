# Walkthrough - Fix Compilation Errors

I have fixed the compilation errors in `MainNavigation.kt` and `JournalEntryScreen.kt`. The app now builds successfully.

## Changes Made

### UI Components

#### [MainNavigation.kt](file:///C:/Users/Tanushri/Downloads/MindMate/MindMate-Android/app/src/main/java/com/mindmate/app/ui/screens/MainNavigation.kt)
- **Fixed Scope Issue**: Moved `mainViewModel.entries.collectAsState()` from the `NavHost` builder lambda to the `MainNavigation` composable body. Calling `@Composable` functions inside non-composable lambdas is not allowed.
- **Fixed Parameter Mismatches**: Removed parameters `onNavigateToArticle`, `articleId`, `onNavigateToPost`, and `postId` from screen invocations in the navigation graph as these screens do not currently accept these parameters.

#### [JournalEntryScreen.kt](file:///C:/Users/Tanushri/Downloads/MindMate/MindMate-Android/app/src/main/java/com/mindmate/app/ui/screens/main/JournalEntryScreen.kt)
- **Fixed Unresolved Reference**: Replaced `Icons.Default.Book` with `Icons.Default.Edit`. The `Book` icon was not available in the project's current Material Icons dependencies.
- **Fixed Field Mismatch**: Updated the `MoodEntry` constructor call to use `stressIndicators` instead of the non-existent `tags` parameter.

## Verification Results

### Automated Tests
- Successfully ran `./gradlew :app:assembleDebug`. The build completed without errors.
