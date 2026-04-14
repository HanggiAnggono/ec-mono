import { useRef, useState } from 'react'
import { FlatList, ListRenderItem, Text, View } from 'react-native'
import { Button } from '@/components/button'
import { useNavigation } from '@react-navigation/native'

// onboarding ecommerce
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Welcome to E-Shop',
    icon: '🛒',
    description: 'Welcomer to our e-commerce app! Discover amazing products.',
  },
  {
    id: '2',
    title: 'Explore Categories',
    description:
      'Browse through a wide range of categories and find what you need.',
    icon: '📂',
  },
  {
    id: '3',
    title: 'Secure Payments',
    description: 'Enjoy seamless shopping with secure payment options.',
    icon: '💳',
  },
]

export const OnboardingScreen = () => {
  const [index, setIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const nav = useNavigation()
  const isLastSlide = index == ONBOARDING_DATA.length - 1

  const renderItem: ListRenderItem<(typeof ONBOARDING_DATA)[0]> = ({
    item,
  }) => {
    return (
      <View className="flex-1 w-[100vw] items-center justify-center p-4">
        <Text className="text-9xl mb-6">{item.icon}</Text>
        <Text className="text-3xl font-bold mb-4">{item.title}</Text>
        <Text className="text-center">{item.description}</Text>
      </View>
    )
  }

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: any[]
  }) => {
    if (viewableItems.length > 0) {
      setIndex(viewableItems[0].index)
    }
  }

  const goToNext = () => {
    const newIndex = index + 1

    if (newIndex < ONBOARDING_DATA.length) {
      flatListRef.current?.scrollToIndex({ index: newIndex })
      setTimeout(() => setIndex(newIndex), 400)
    }
  }

  const goToPrev = () => {
    const newIndex = index - 1

    if (newIndex >= 0) {
      flatListRef.current?.scrollToIndex({ index: newIndex })
      setTimeout(() => setIndex(newIndex), 400)
    }
  }

  const goToHome = () => {
    nav.navigate('Login' as never)
  }

  return (
    <View>
      <FlatList
        horizontal
        ref={flatListRef}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        onViewableItemsChanged={handleViewableItemsChanged}
        className="h-full"
      />
      <View className="absolute bottom-32 gap-3 w-full flex flex-row items-center justify-center">
        {ONBOARDING_DATA.map((item, i) => (
          <View
            key={item.id}
            className={`size-2 rounded-full ${
              item.id === ONBOARDING_DATA[index].id
                ? 'bg-blue-500'
                : 'bg-gray-400'
            }`}
          />
        ))}
      </View>
      <View className="absolute bottom-10 w-full px-10 flex flex-row justify-between">
        <Button onPress={goToPrev}>Previous</Button>
        <Button onPress={isLastSlide ? goToHome : goToNext}>
          {isLastSlide ? 'Continue' : 'Next'}
        </Button>
      </View>
    </View>
  )
}
