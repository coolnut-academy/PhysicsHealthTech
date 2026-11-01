/**
 * PhysicsHealthTech V2.0 - Client API Adapter
 * Handles communication with Google Apps Script Web App or local mock engine
 */

class ApiClient {
  constructor() {
    this.sessionToken = sessionStorage.getItem("PHT_SESSION_TOKEN") || "";
    this.userProfile = null;
    try {
      const stored = sessionStorage.getItem("PHT_USER_PROFILE");
      if (stored) this.userProfile = JSON.parse(stored);
    } catch (e) {}
  }

  setSession(token, profile) {
    this.sessionToken = token;
    this.userProfile = profile;
    sessionStorage.setItem("PHT_SESSION_TOKEN", token);
    sessionStorage.setItem("PHT_USER_PROFILE", JSON.stringify(profile));
  }

  clearSession() {
    this.sessionToken = "";
    this.userProfile = null;
    sessionStorage.removeItem("PHT_SESSION_TOKEN");
    sessionStorage.removeItem("PHT_USER_PROFILE");
  }

  isLoggedIn() {
    return Boolean(this.sessionToken);
  }

  getRole() {
    return this.userProfile ? this.userProfile.role : null;
  }

  getProfile() {
    return this.userProfile;
  }

  /**
   * Dispatch RPC Action
   * 
   * @param {string} action - Action name (e.g. 'student.dashboard')
   * @param {Object} payload - Action parameters
   * @returns {Promise<Object>} Response envelope { ok: boolean, data?: any, error?: any }
   */
  async call(action, payload = {}) {
    const envelope = {
      action,
      request_id: `req_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`,
      session_token: this.sessionToken,
      payload
    };

    // 1. If GAS Web App URL is configured and not forced to demo
    const gasUrl = window.CONFIG.getApiUrl();
    if (gasUrl && !window.CONFIG.isDemoMode()) {
      try {
        // Send POST as text/plain to avoid CORS preflight OPTIONS request on Apps Script
        const res = await fetch(gasUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(envelope)
        });

        if (!res.ok) {
          throw new Error(`HTTP_${res.status}: ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Google Apps Script ได้`);
        }

        const data = await res.json();
        return data;
      } catch (err) {
        console.warn("GAS WebApp call failed, falling back to local engine if enabled:", err);
        throw err;
      }
    }

    // 2. Demo / Mock Engine Fallback (Immediate local testing)
    return this.dispatchMock(action, payload);
  }

  /**
   * Local Mock Dispatcher (for GitHub Pages preview & offline verification)
   */
  async dispatchMock(action, payload) {
    // Artificial small delay for realistic UX transitions
    await new Promise(r => setTimeout(r, 120));

    if (!window.MockBackend) {
      throw new Error("MOCK_NOT_INITIALIZED: ระบบจำลองยังไม่พร้อมทำงาน");
    }

    return window.MockBackend.handleApi(action, payload, this.sessionToken);
  }
}

window.apiClient = new ApiClient();

