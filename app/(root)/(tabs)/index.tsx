import { Link } from "expo-router";
import { Linking, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text>hello</Text>

      <Link href="/home">Home</Link>
      <Link href="/explore">Explore</Link>
      <Link href="/sign-in">Sign In</Link>
      <Link href="/sign-in">Sign In</Link>


    </View>
  );
}
