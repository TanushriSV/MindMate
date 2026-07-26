package com.mindmate.app.data.network

import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.json.JSONObject

class AuthInterceptor constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val requestBuilder = originalRequest.newBuilder()
        
        val token = runBlocking { tokenManager.authToken.firstOrNull() }
        
        token?.let {
            requestBuilder.addHeader("Authorization", "Bearer $it")
        }
        
        var response = chain.proceed(requestBuilder.build())
        
        // Handle 401 by trying to refresh, avoiding loops on auth endpoints
        if (response.code == 401 && !originalRequest.url.encodedPath.contains("/api/auth/")) {
            response.close() // Close the failed response
            
            val refreshRequest = Request.Builder()
                .url(originalRequest.url.newBuilder().encodedPath("/api/auth/refresh").build())
                .post(ByteArray(0).toRequestBody(null))
                .addHeader("Authorization", "Bearer $token")
                .build()
                
            val refreshResponse = chain.proceed(refreshRequest)
            
            if (refreshResponse.isSuccessful) {
                val bodyString = refreshResponse.body?.string()
                val newToken = try {
                    JSONObject(bodyString ?: "{}").optString("token")
                } catch (e: Exception) {
                    ""
                }
                
                if (newToken.isNotEmpty()) {
                    runBlocking { tokenManager.saveToken(newToken) }
                    refreshResponse.close()
                    
                    val retriedRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer $newToken")
                        .build()
                    return chain.proceed(retriedRequest)
                }
            }
            
            refreshResponse.close()
            runBlocking { tokenManager.clearToken() }
            
            // Return a failed response so caller knows it failed
            return chain.proceed(originalRequest)
        }
        
        if (response.code == 401) {
            runBlocking { tokenManager.clearToken() }
        }
        
        return response
    }
}
