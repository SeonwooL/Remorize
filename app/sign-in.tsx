import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'



const Signin = () => {
    const handleLogin = () => {};

  return (

    

    <SafeAreaView className="bg-white h-full">
        <ScrollView contentContainerClassName="h-full">
            

      <Text className="text-base text-center uppercase font-rubik text-black-200">sign-in</Text>


        <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
            Let's Get You Closer to{"\n"}
             
            <Text className="text-primary-300">English</Text>
        </Text>

        <Text className="text-lg font-rubik text-black-200 text-center mt-12">
            Login to Remorize with Google
        </Text>

        <TouchableOpacity onPress={handleLogin}
        className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5">



        </TouchableOpacity>

        </ScrollView>
    </SafeAreaView>




  )
}

export default Signin