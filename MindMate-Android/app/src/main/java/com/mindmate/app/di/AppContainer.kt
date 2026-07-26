package com.mindmate.app.di

import android.content.Context
import com.mindmate.app.data.network.MindMateApiService
import com.mindmate.app.data.network.TokenManager
import com.mindmate.app.data.repository.MindMateRepository
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import com.mindmate.app.data.network.AuthInterceptor

interface AppContainer {
    val tokenManager: TokenManager
    val mindMateRepository: MindMateRepository
}

class DefaultAppContainer(private val context: Context) : AppContainer {
    private val BASE_URL = "http://10.0.2.2:3000"

    override val tokenManager: TokenManager by lazy {
        TokenManager(context)
    }

    private val authInterceptor: AuthInterceptor by lazy {
        AuthInterceptor(tokenManager)
    }

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .build()
    }

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    private val apiService: MindMateApiService by lazy {
        retrofit.create(MindMateApiService::class.java)
    }

    override val mindMateRepository: MindMateRepository by lazy {
        MindMateRepository(apiService, tokenManager)
    }
}
