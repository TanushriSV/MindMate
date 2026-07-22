package com.mindmate.app

import android.app.Application

import com.mindmate.app.di.AppContainer
import com.mindmate.app.di.DefaultAppContainer

class MindMateApplication : Application() {
    lateinit var container: AppContainer
    override fun onCreate() {
        super.onCreate()
        container = DefaultAppContainer(this)
    }
}
