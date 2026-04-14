import { useMemo } from 'react'
import { ColorValue, useColorScheme } from 'react-native'
import { dark, light } from '@/shared/themes'

type ThemeGradient = readonly [ColorValue, ColorValue, ...ColorValue[]]

type TailwindThemeColors = {
  primary: ColorValue
  background: ColorValue
  surface: ColorValue
  text: ColorValue
  textSecondary: ColorValue
  border: ColorValue
}

const toTailwindColors = (palette: ThemeGradient): TailwindThemeColors => ({
  primary: palette[0],
  background: palette[1],
  surface: palette[2],
  text: palette[3],
  textSecondary: palette[3],
  border: palette[4],
})

export const useThemes = () => {
  const scheme = useColorScheme()
  const gradient = scheme === 'dark' ? dark : light

  const tailwind = useMemo(() => toTailwindColors(gradient), [gradient])

  return tailwind
}
