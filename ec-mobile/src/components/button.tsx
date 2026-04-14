import clsx from 'clsx'
import { ComponentProps, ReactNode } from 'react'
import { Pressable, PressableProps, Text, View } from 'react-native'
import Icon from './icon'

const buttonVariants = {
  primary: {
    btn: 'bg-primary',
    text: 'text-surface',
    icon: 'white',
    pressed: { btn: 'bg-primary/40', text: '' },
  },
  default: {
    btn: '',
    text: 'text-text',
    icon: '',
    pressed: { btn: 'bg-primary/40', text: 'text-surface' },
  },
}

interface Props extends PressableProps {
  icon?: ComponentProps<typeof Icon>['name']
  variant?: keyof typeof buttonVariants
}

export const Button = ({
  children,
  onPress,
  className,
  icon,
  disabled,
  variant: _variant = 'default',
  ...props
}: Props) => {
  const variant = buttonVariants[_variant]
  return (
    <Pressable
      {...props}
      onPress={onPress}
      className={className}
      disabled={disabled}
    >
      {({ pressed }) => {
        return (
          <View
            className={clsx(
              'flex self-start flex-row items-center gap-2 p-3 py-2 overflow-hidden rounded-full',
              {
                [variant.pressed.btn]: pressed,
              },
              variant.btn
            )}
          >
            {icon && (
              <Icon
                name={icon}
                size={20}
                className={pressed ? 'text-white' : 'text-blue-500'}
              />
            )}
            <Text
              className={clsx(variant.text, 'text-xl', {
                [variant.pressed.text]: pressed,
                'text-gray-300': disabled,
              })}
            >
              {children as ReactNode}
            </Text>
          </View>
        )
      }}
    </Pressable>
  )
}
