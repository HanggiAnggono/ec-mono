import { LinearGradient } from '@/components/gradient'
import { dark, light } from '@/shared/themes'
import { ColorValue, useColorScheme, View, ViewProps } from 'react-native'


export const Layout = (props: ViewProps) => {
  const scheme = useColorScheme()
  const colors: readonly [ColorValue, ColorValue, ...ColorValue[]] =
    scheme === 'dark' ? dark : light

  return (
    <View
      {...props}
      className={`flex flex-1 bg-black ${props.className || ''}`}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        // locations={[0, 0.1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
        }}
      />
      {props.children}
    </View>
  )
}
