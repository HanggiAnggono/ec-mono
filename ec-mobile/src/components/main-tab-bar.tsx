import { useThemes } from '@/shared/hooks/use-themes'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import clsx from 'clsx'
import { Pressable, View } from 'react-native'

export const MainTabBar = (props: BottomTabBarProps) => {
  const tabs = Object.entries(props.descriptors)
  const activeTabIndex = props.state.index
  const { text, primary } = useThemes()

  return (
    <View className="flex flex-row justify-between items-center mx-10 bg-background rounded-full absolute bottom-4 left-4 right-4 shadow-lg shadow-red-400 h-20">
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
              'rounded-full h-full flex flex-1 justify-center items-center px-5',
              isActive ? 'bg-primary' : ''
            )}
          >
            {descriptor.options.tabBarIcon?.({
              color: isActive ? text.toString() : primary.toString(),
              focused: isActive,
              size: 30,
            })}
          </Pressable>
        )
      })}
    </View>
  )
}
