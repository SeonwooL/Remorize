import { Link } from "expo-router";
import { Linking, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";



export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
 
      <Text className="font-bold text-lg my-10">Welcome to Remorize</Text>
      <Link href="/home">Home</Link>
      <Link href="/explore">Explore</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/sign-in">Sign In</Link>


    </View>

    
  );
}
