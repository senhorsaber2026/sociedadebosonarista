import { onRequestOptions as __api_auth_social_js_onRequestOptions } from "C:\\Users\\kalit\\Downloads\\sociedade bosonarista\\functions\\api\\auth\\social.js"
import { onRequestPost as __api_auth_social_js_onRequestPost } from "C:\\Users\\kalit\\Downloads\\sociedade bosonarista\\functions\\api\\auth\\social.js"
import { onRequest as __api_auth_check_js_onRequest } from "C:\\Users\\kalit\\Downloads\\sociedade bosonarista\\functions\\api\\auth\\check.js"

export const routes = [
    {
      routePath: "/api/auth/social",
      mountPath: "/api/auth",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_auth_social_js_onRequestOptions],
    },
  {
      routePath: "/api/auth/social",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_social_js_onRequestPost],
    },
  {
      routePath: "/api/auth/check",
      mountPath: "/api/auth",
      method: "",
      middlewares: [],
      modules: [__api_auth_check_js_onRequest],
    },
  ]