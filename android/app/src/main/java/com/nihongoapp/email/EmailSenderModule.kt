package com.nihongoapp.email

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.nihongoapp.utils.EmailSender

@ReactModule(name = EmailSenderModule.NAME)
class EmailSenderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val NAME = "EmailSender"
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun sendOTP(recipientEmail: String, otp: String, promise: Promise) {
        try {
            EmailSender.sendOTP(recipientEmail, otp, {
                promise.resolve(true)
            }, { exception ->
                promise.reject("EMAIL_SEND_FAILED", exception.message, exception)
            })
        } catch (e: Exception) {
            promise.reject("EMAIL_SEND_ERROR", e.message, e)
        }
    }
}
