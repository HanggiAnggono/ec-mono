import clsx from 'clsx'
import { TextInput as RNTI, TextInputProps } from 'react-native'

export function TextInput({ ...props }: TextInputProps) {
  return (
    <RNTI
      {...props}
      className={clsx(
        `bg-surface border-none rounded-2xl p-4 mb-4 text-text placeholder:text-gray-400 dark:placeholder:text-gray-600`,
        props.className
      )}
    />
  )
}
