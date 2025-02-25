/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";
import authgear, {
  Page,
  ReactNativeContainer,
  SessionState,
  SessionStateChangeReason,
} from "@authgear/react-native";

function App(): React.JSX.Element {
  const [sessionState, setSessionState] = useState<SessionState | null>(() => {
    return authgear.sessionState;
  });

  const loggedIn = sessionState === "AUTHENTICATED";
  const delegate = useMemo(() => {
    const d = {
      onSessionStateChange: (
        container: ReactNativeContainer,
        _reason: SessionStateChangeReason
      ) => {
        setSessionState(container.sessionState);
      },
      //Empty WeChat support code to suppress error in older version of Authgear SDK
      sendWechatAuthRequest: () => {},
    };
    return d;
  }, [setSessionState]);

  useEffect(() => {
    authgear.delegate = delegate;

    return () => {
      authgear.delegate = undefined;
    };
  }, [delegate]);

  const postConfigure = useCallback(async () => {
    const sessionState = authgear.sessionState;

    // if user has an existing session, call SDK fetchUserInfo method to get the user's info and refresh access token when necessary
    if (sessionState === "AUTHENTICATED") {
      await authgear.fetchUserInfo();
    }
  }, []);

  useEffect(() => {
    const configure = async () => {
      try {
        await authgear.configure({
          clientID: "<CLIENT_ID>",
          endpoint: "<AUTHGEAR_ENDPOINT>",
        });
        await postConfigure();
      } catch (error) {
        console.log("Error:" + error);
      }
    };

    configure();
  }, [postConfigure]);

  const authenticate = useCallback(async () => {
    try {
      authgear.authenticate({
        redirectURI: "com.authgear.example.rn://host/path",
      });
    } catch (error) {
      console.log("Authentication Error:" + error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      authgear.logout();
    } catch (error) {
      console.log("Error:" + error);
    }
  }, []);

  const showUserInfo = useCallback(async () => {
    try {
      const userInfo = await authgear.fetchUserInfo();
      Alert.alert("User Info", JSON.stringify(userInfo, null, 2));
    } catch (error) {
      console.log("Error:" + error);
    }
  }, []);

  const openSettings = useCallback(() => {
    try {
      authgear.open(Page.Settings);
    } catch (error) {
      console.log("Error:" + error);
    }
  }, []);

  return (
    <SafeAreaView>
      <StatusBar />
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        {!loggedIn ? (
          <View>
            <Text style={{ paddingTop: 50, paddingBottom: 16, fontSize: 40 }}>
              Welcome
            </Text>
            <Button onPress={authenticate} title="Login" />
          </View>
        ) : (
          <View>
            <Text style={{ paddingTop: 50, paddingBottom: 16 }}>
              Welcome User
            </Text>
            <Button onPress={logout} title="Logout" />
            <View style={{ height: 8 }} />
            <Button onPress={showUserInfo} title="Show User Info" />
            <View style={{ height: 8 }} />
            <Button onPress={openSettings} title="User Settings" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default App;
