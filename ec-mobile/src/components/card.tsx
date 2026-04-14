import clsx from 'clsx'
import { View, ViewProps } from 'react-native'

export default function Card(props: ViewProps) {
  return (
    <View
      className={clsx(
        'border border-background bg-background rounded-xl *:*:text-text',
        props.className
      )}
    >
      {props.children}
    </View>
  )
}
