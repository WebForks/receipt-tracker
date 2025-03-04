import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { createClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system";

const supabase = createClient(
  "https://ixspfaizwlkvzozfaiyx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4c3BmYWl6d2xrdnpvemZhaXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTk4MzUsImV4cCI6MjA1NjQzNTgzNX0._qA0EzRDyLp1mjH5DbDq4_mQmOwMGbDrzbMeq86hos8"
);
export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }
  const saveImage = async () => {
    if (!uri) return;

    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.functions.invoke(
        "extract-info-from-image",
        {
          body: { image: `data:image/jpeg;base64,${base64}` },
        }
      );

      if (error) {
        console.error("Failed to invoke function:", error);
      } else {
        console.log("Function response:", data);
      }

      // Clear the image after saving (optional)
      setUri(null);
    } catch (err) {
      console.error("Error saving image:", err);
    }
  };
  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri ?? null);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderPicture = () => {
    return (
      <View className="mt-4 items-center space-y-4">
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ width: 600, aspectRatio: 1 }}
        />
        <View className="w-full items-center space-y-2">
          <View className="w-64">
            <Button onPress={() => setUri(null)} title="Take another picture" />
          </View>
          <View className="w-64">
            <Button onPress={() => setUri(null)} title="Save" />
          </View>
        </View>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={mode}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <AntDesign name="picture" size={32} color="white" />
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: "white",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="white" />
          </Pressable>
        </View>
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});

/* Can you create a button that says use this picture or something like that with typescript and tailwind and use something like this javascript code in order to run this edge function in my supabase.  It should send the image to my supabase edge function and then console log the supabase edge function response */
