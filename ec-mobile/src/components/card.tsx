import clsx from 'clsx'
import { View, ViewProps } from 'react-native'

export default function Card({ className, children, ...props }: ViewProps) {
  return (
    <View {...props} className={clsx('bg-primary/20 rounded-2xl', className)}>
      {children}
    </View>
  )
}
