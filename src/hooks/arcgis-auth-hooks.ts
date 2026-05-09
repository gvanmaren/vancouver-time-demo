/**
 * Copyright 2026 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import { useAuth as useAuthContext } from "../context/Auth/useAuth";
import IdentityManager from "@arcgis/core/identity/IdentityManager";

declare global {
  interface Window {
    setOAuthResponseHash: (responseHash: string) => void;
  }
}

const info = new OAuthInfo({
  appId: "KojZjH6glligLidj",
  popup: true,
  popupCallbackUrl: `${document.location.origin}${document.location.pathname}oauth-callback-api.html`,
});

IdentityManager.registerOAuthInfos([info]);

window.setOAuthResponseHash = (responseHash: string) => {
  IdentityManager.setOAuthResponseHash(responseHash);
};

const arcGISLogin = async () => {
  return IdentityManager.getCredential(info.portalUrl + "/sharing", {
    oAuthPopupConfirmation: false,
  });
};

const arcGISLogout = () => {
  IdentityManager.destroyCredentials();
  window.location.reload();
};

export function useAuth() {
  const { user, setUser } = useAuthContext();

  // Optional: Custom login logic using credentials
  const login = async () => {
    try {
      await arcGISLogin();
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, error: err };
    }
  };

  const logout = () => {
    arcGISLogout();
    setUser(null);
  };

  return {
    user,
    login,
    logout,
  };
}
