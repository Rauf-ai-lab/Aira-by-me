package com.example

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
  private var pendingPermissionRequest: PermissionRequest? = null

  private val requestAudioPermissionLauncher =
      registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
          pendingPermissionRequest?.grant(pendingPermissionRequest?.resources)
        } else {
          pendingPermissionRequest?.deny()
        }
        pendingPermissionRequest = null
      }

  private val fileChooserLauncher =
      registerForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        if (uris != null && uris.isNotEmpty()) {
          fileUploadCallback?.onReceiveValue(uris.toTypedArray())
        } else {
          fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
      }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      MyApplicationTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
          Box(
              modifier = Modifier
                  .fillMaxSize()
                  .systemBarsPadding()
                  .imePadding()
          ) {
            AiraWebViewContainer(
                onOpenFileChooser = { callback ->
                  fileUploadCallback = callback
                  fileChooserLauncher.launch("image/*")
                },
                onRequestWebPermission = { request ->
                  pendingPermissionRequest = request
                  if (ContextCompat.checkSelfPermission(
                          this@MainActivity,
                          Manifest.permission.RECORD_AUDIO
                      ) == PackageManager.PERMISSION_GRANTED
                  ) {
                    request.grant(request.resources)
                  } else {
                    requestAudioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                  }
                }
            )
          }
        }
      }
    }
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    val webView = currentWebView
    if (webView != null && webView.canGoBack()) {
      webView.goBack()
    } else {
      super.onBackPressed()
    }
  }

  companion object {
    var currentWebView: WebView? = null
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AiraWebViewContainer(
    onOpenFileChooser: (ValueCallback<Array<Uri>>) -> Unit,
    onRequestWebPermission: (PermissionRequest) -> Unit,
    modifier: Modifier = Modifier
) {
  AndroidView(
      modifier = modifier.fillMaxSize(),
      factory = { context ->
        WebView(context).apply {
          layoutParams = ViewGroup.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT
          )
          MainActivity.currentWebView = this

          setBackgroundColor(0xFF0E0E10.toInt()) // Match dark theme background

          val assetLoader = WebViewAssetLoader.Builder()
              .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
              .build()

          val cookieManager = android.webkit.CookieManager.getInstance()
          cookieManager.setAcceptCookie(true)
          cookieManager.setAcceptThirdPartyCookies(this, true)

          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
          }

          webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
              request?.let { onRequestWebPermission(it) }
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: android.os.Message?
            ): Boolean {
              val dialog = android.app.Dialog(context, android.R.style.Theme_Black_NoTitleBar_Fullscreen)
              val popupWebView = WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                settings.apply {
                  javaScriptEnabled = true
                  domStorageEnabled = true
                  databaseEnabled = true
                  setSupportMultipleWindows(true)
                  javaScriptCanOpenWindowsAutomatically = true
                  mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                  setSupportZoom(true)
                  builtInZoomControls = true
                  displayZoomControls = false
                }
                val popupCookieManager = android.webkit.CookieManager.getInstance()
                popupCookieManager.setAcceptCookie(true)
                popupCookieManager.setAcceptThirdPartyCookies(this, true)

                webChromeClient = object : WebChromeClient() {
                  override fun onCloseWindow(window: WebView?) {
                    dialog.dismiss()
                    window?.destroy()
                  }
                }
                webViewClient = object : WebViewClient() {
                  override fun shouldOverrideUrlLoading(
                      view: WebView?,
                      request: WebResourceRequest?
                  ): Boolean {
                    return false
                  }
                }
              }
              dialog.setContentView(popupWebView)
              dialog.setOnDismissListener {
                popupWebView.destroy()
              }
              dialog.show()

              val transport = resultMsg?.obj as? WebView.WebViewTransport
              transport?.webView = popupWebView
              resultMsg?.sendToTarget()
              return true
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
              if (filePathCallback != null) {
                onOpenFileChooser(filePathCallback)
                return true
              }
              return false
            }
          }

          webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
              val url = request?.url ?: return null
              return assetLoader.shouldInterceptRequest(url)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
              val url = request?.url?.toString() ?: return false
              if (url.startsWith("https://appassets.androidplatform.net/")) {
                return false
              }
              return false
            }
          }

          loadUrl("https://appassets.androidplatform.net/assets/index.html")
        }
      },
      update = {
        // Updates if required
      }
  )
}
