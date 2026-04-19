import { useThemes } from '@/shared/hooks/use-themes'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import clsx from 'clsx'
import { Pressable, Text, View } from 'react-native'

export const MainTabBar = (props: BottomTabBarProps) => {
  const tabs = Object.entries(props.descriptors)
  const activeTabIndex = props.state.index
  const { text, primary } = useThemes()

  return (
    <View className="flex flex-row justify-between items-center mx-10 bg-background rounded-[2rem] absolute bottom-4 left-4 right-4 shadow-lg shadow-red-400 p-4">
      {tabs.map((tab, i) => {
        const [tabKey, descriptor] = tab
        const isActive = i === activeTabIndex

        const handlePress = () => {
          const event = props.navigation.emit({
            type: 'tabPress',
            target: descriptor.route.name,
            canPreventDefault: true,
          })

          if (!event.defaultPrevented) {
            props.navigation.navigate(descriptor.route.name)
          }
        }

        return (
          <Pressable
            key={tabKey}
            onPress={handlePress}
            className={clsx(
              'rounded-xl h-full flex flex-1 gap-1 justify-center items-center p-2',
              isActive ? 'bg-primary' : ''
            )}
          >
            {descriptor.options.tabBarIcon?.({
              color: isActive ? text.toString() : primary.toString(),
              focused: isActive,
              size: 20,
            })}
            <Text
              className={`text-sm ${isActive ? 'text-surface' : 'text-primary'}`}
            >
              {descriptor.route.name}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
