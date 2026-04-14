import { useRef } from 'react'
import { Pressable, View } from 'react-native'
import * as Animatable from 'react-native-animatable'

const { height } = require('react-native').Dimensions.get('window')

export const BottomSheet = ({ children, isOpen, setIsOpen }) => {
  const bgRef = useRef<Animatable.View & View>(null)
  const sheetRef = useRef<Animatable.View & View>(null)

  async function handleBackdropTouch() {
    await Promise.all([
      bgRef.current?.fadeOut?.(300),
      sheetRef.current?.animate?.(
        {
          from: { transform: [{ translateY: 0 }] },
          to: { transform: [{ translateY: height }] },
        },
        700
      ),
    ])
    setIsOpen(false)
  }

  if (!isOpen) {
    return null
  }

  return (
    <View className="absolute inset-0 h-full z-10  w-full">
      <Animatable.View
        ref={bgRef}
        animation="fadeIn"
        duration={300}
        className="h-screen w-screen bg-black/70"
        onTouchEnd={handleBackdropTouch}
      />
      <Animatable.View
        ref={sheetRef}
        className="absolute bottom-0 w-screen bg-background pt-2 pb-safe-or-10 rounded-t-2xl z-20"
        animation="slideInUp"
        duration={300}
        pointerEvents="auto"
      >
        <View className="flex items-center justify-center">
          <Pressable className="w-12 h-2 bg-slate-500 rounded-2xl" />
        </View>
        <View className="pt-10" />
        {isOpen && children}
      </Animatable.View>
    </View>
  )
}
