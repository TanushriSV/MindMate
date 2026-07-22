package com.mindmate.app.data.network

import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val requestBuilder = chain.request().newBuilder()
        
        // Block to get current token synchronously for okhttp interceptor
        val token = runBlocking { tokenManager.authToken.firstOrNull() }
        
        token?.let {
            requestBuilder.addHeader("Authorization", "Bearer $it")
        }
        
        val response = chain.proceed(requestBuilder.build())
        
        // Handle 401 globally by clearing token so UI reacts
        if (response.code == 401) {
            runBlocking { tokenManager.clearToken() }
        }
        
        return response
    }
}
