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
import { supabase } from "~/utils/supabase";
import { nanoid } from "nanoid";
import { decode } from "base64-arraybuffer";

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
  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri ?? null);
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleSave = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log("Error fetching user:", userError.message);
      return;
    }
    if (!userData?.user) {
      console.log("No user logged in");
      return;
    }

    if (!uri) return;
    try {
      const user = userData.user.id; // Get the logged-in user

      function generateRandomString(length: number): string {
        const chars =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }

      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");
      const randomStr = generateRandomString(8);
      const fileName = `${user}_${timestamp}_${randomStr}.jpg`;
      const filePath = `receipts/${user}/${fileName}`;

      console.log("File path:", filePath);
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.error("File does not exist:", uri);
        return;
      }

      // Read file as Base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // console.log("Base64:", base64);

      // Convert Base64 to ArrayBuffer
      const arrayBuffer = decode(base64);
      console.log("ArrayBuffer:", arrayBuffer);

      // Upload file using ArrayBuffer
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return;
      }
      console.log("Upload successful:", uploadData);
      const DATA_URL = supabase.storage.from("receipts").getPublicUrl(filePath);
      console.log("Public URL:", DATA_URL);
      const imageUrl = DATA_URL.data.publicUrl;
      console.log("File URL:", imageUrl);

      // Insert or update the receipts database
      const { data: receiptData, error: receiptError } = await supabase
        .from("receipts")
        .insert([
          {
            user_id: user,
            title: "New Receipt", // Placeholder, replace as needed
            date: new Date().toISOString(),
            note: "Added via app",
            total_cost: 0, // Placeholder, replace as needed
            category: "Misc", // Placeholder
            subcategory: "General", // Placeholder
            repeating: false,
            repeat_frequency: null,
            account: "", // Left blank for now
            completed: false,
            path_to_img: filePath,
          },
        ]);

      const { data, error } = await supabase.functions.invoke("image-to-ai", {
        body: { imageUrl: imageUrl },
      });

      if (error) {
        console.error("Error processing image:", error);
        return;
      }
      console.log("AI Response:", data);

      if (receiptError) {
        console.error("Error inserting receipt:", receiptError);
        return;
      }

      console.log("Receipt added:", receiptData);

      // Check if the completed column is true
      const { data: checkData, error: checkError } = await supabase
        .from("receipts")
        .select("completed")
        .eq("path_to_img", filePath)
        .single();

      if (checkError) {
        console.error("Error checking completion status:", checkError);
        return;
      }

      if (checkData.completed) {
        console.log("Receipt is completed.");
      } else {
        console.log("Receipt is not completed yet.");
      }
    } catch (err) {
      console.error("Error saving file:", err);
    }
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
            <Button onPress={handleSave} title="Save" />
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
